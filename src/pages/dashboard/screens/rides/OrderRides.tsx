import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Row,
  Col,
  Select,
  Radio,
  Spin,
  Tag,
  AutoComplete,
  Progress
} from 'antd';
import {
  EnvironmentOutlined,
  AimOutlined,
  CarOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  SafetyOutlined,
  StarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  CompassOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import rideService, { 
  RIDE_OPTIONS, 
  formatCurrency, 
  calculateLocalEstimate,
} from '@/services/rideService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface LocationData {
  address: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface RideFormValues {
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  destination: string;
  destLat?: number;
  destLng?: number;
  rideType: 'bicycle' | 'motorcycle' | 'car';
  instructions?: string;
  paymentMethod: 'online' | 'cash';
  phoneNumber: string;
}

const OrderRide: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [estimating, setEstimating] = useState<boolean>(false);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // State for autocomplete suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [loadingPickupSuggestions, setLoadingPickupSuggestions] = useState<boolean>(false);
  const [loadingDestinationSuggestions, setLoadingDestinationSuggestions] = useState<boolean>(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState<boolean>(false);

  // State to track coordinates separately to ensure they're always available
  const [coordinates, setCoordinates] = useState<{
    pickupLat?: number;
    pickupLng?: number;
    destLat?: number;
    destLng?: number;
  }>({});

  const rideOptions = RIDE_OPTIONS;

  // Payment options - Only cash is available
  const paymentOptions = [
    { 
      value: 'cash', 
      label: 'Pay Cash', 
      icon: <WalletOutlined />,
      description: 'Pay cash to rider upon delivery',
      color: '#10B981',
      available: true
    },
    { 
      value: 'online', 
      label: 'Pay Online', 
      icon: <CreditCardOutlined />,
      description: 'Pay with card or digital wallet',
      color: '#9CA3AF',
      available: false,
      badge: 'Coming Soon'
    }
  ];

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          process.env.REACT_APP_GMAPS_API_KEY || import.meta.env.VITE_GMAPS_API_KEY
        }&libraries=places`;
        script.async = true;
        script.onerror = () => {
          toast.error('Failed to load Google Maps. Some features may be limited.');
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();
  }, []);

  const tryFetchCoordinates = async (address: string): Promise<LocationData | null> => {
    if (!address.trim()) {
      return null;
    }
  
    // Wait for Google Maps to load
    if (!window.google || !window.google.maps) {
      // Try loading again
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!window.google || !window.google.maps) {
        return {
          address: address,
          fullAddress: address,
          coordinates: undefined
        };
      }
    }
  
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode(
          { address: address },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              const locationData: LocationData = {
                address: results[0].formatted_address || address,
                fullAddress: results[0].formatted_address || address,
                coordinates: {
                  lat: location.lat(),
                  lng: location.lng()
                }
              };
              console.log('Successfully got coordinates:', locationData.coordinates);
              resolve(locationData);
            } else {
              console.warn(`Geocoding failed for "${address}":`, status);
              
              // Try a more flexible approach for common Nigerian addresses
              if (address.includes('Lagos') || address.includes('Abuja') || address.includes('Nigeria')) {
                console.log('Trying fallback coordinates for Nigerian location');
                // Return approximate coordinates for major Nigerian cities
                let fallbackCoords = { lat: 6.5244, lng: 3.3792 }; // Default to Lagos
                
                if (address.includes('Abuja')) {
                  fallbackCoords = { lat: 9.0765, lng: 7.3986 };
                }
                
                const fallbackData: LocationData = {
                  address: address,
                  fullAddress: address,
                  coordinates: fallbackCoords
                };
                resolve(fallbackData);
              } else {
                const locationData: LocationData = {
                  address: address,
                  fullAddress: address,
                  coordinates: undefined
                };
                resolve(locationData);
              }
            }
          }
        );
      });
    } catch (error) {
      return {
        address: address,
        fullAddress: address,
        coordinates: undefined
      };
    }
  };

  const fetchAutocompleteSuggestions = async (
    input: string, 
    setSuggestions: React.Dispatch<React.SetStateAction<string[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    // If Google Maps isn't loaded, don't try to fetch suggestions
    if (!window.google || !window.google.maps.places) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input,
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'ng' }
        },
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            const suggestions = predictions.map(p => p.description);
            setSuggestions(suggestions);
          } else {
            console.warn('Autocomplete failed:', status);
            setSuggestions([]);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;


        console.log(latitude, longitude,'dsdsd')
        
        // If Google Maps is loaded, try to get address
        if (window.google && window.google.maps) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results?.[0]) {
                  form.setFieldsValue({
                    pickupLocation: results[0].formatted_address,
                    pickupLat: latitude,
                    pickupLng: longitude
                  });
                  toast.success('Current location set successfully!');
                  calculateEstimate();
                } else {
                  // Fallback to coordinates
                  form.setFieldsValue({
                    pickupLocation: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                    pickupLat: latitude,
                    pickupLng: longitude
                  });
                  toast.success('Current coordinates set!');
                  calculateEstimate();
                }
                setGettingCurrentLocation(false);
              }
            );
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            form.setFieldsValue({
              pickupLocation: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              pickupLat: latitude,
              pickupLng: longitude
            });
            toast.success('Current coordinates set!');
            calculateEstimate();
            setGettingCurrentLocation(false);
          }
        } else {
          // Google Maps not loaded, just use coordinates
          form.setFieldsValue({
            pickupLocation: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            pickupLat: latitude,
            pickupLng: longitude
          });
          toast.success('Current coordinates set!');
          calculateEstimate();
          setGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
        setGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePickupLocationSelect = async (value: string) => {
    try {
      form.setFieldsValue({ pickupLocation: value });
      setPickupSuggestions([]);
      
      const locationData = await tryFetchCoordinates(value);
      
      if (locationData?.coordinates) {
        const lat = locationData.coordinates.lat;
        const lng = locationData.coordinates.lng;
        
        // Update both form and state
        form.setFieldsValue({
          pickupLat: lat,
          pickupLng: lng
        });
        
        setCoordinates(prev => ({
          ...prev,
          pickupLat: lat,
          pickupLng: lng
        }));
        
        // Get current form values with new coordinates
        const currentValues = form.getFieldsValue();
        const values = {
          ...currentValues,
          pickupLat: lat,
          pickupLng: lng
        };
        
        // Calculate estimate if we have all required fields
        if (values.destination && values.rideType && values.pickupLat && values.destLat) {
          calculateEstimateWithValues(values);
        }
      }
    } catch (error) {
      // Silent fail
    }
  };
  
  const handleDestinationSelect = async (value: string) => {
    try {
      form.setFieldsValue({ destination: value });
      setDestinationSuggestions([]);
      
      const locationData = await tryFetchCoordinates(value);
      
      if (locationData?.coordinates) {
        const lat = locationData.coordinates.lat;
        const lng = locationData.coordinates.lng;
        
        // Update both form and state
        form.setFieldsValue({
          destLat: lat,
          destLng: lng
        });
        
        setCoordinates(prev => ({
          ...prev,
          destLat: lat,
          destLng: lng
        }));
        
        // Get current form values with new coordinates
        const currentValues = form.getFieldsValue();
        const values = {
          ...currentValues,
          destLat: lat,
          destLng: lng
        };
        
        // Calculate estimate if we have all required fields
        if (values.pickupLocation && values.rideType && values.pickupLat && values.destLat) {
          calculateEstimateWithValues(values);
        }
      }
    } catch (error) {
      // Silent fail
    }
  };
  
  // New helper function that accepts explicit values
  const calculateEstimateWithValues = async (explicitValues: any) => {
    if (!explicitValues.pickupLocation || !explicitValues.destination || !explicitValues.rideType) {
      return;
    }
  
    if (!explicitValues.pickupLat || !explicitValues.destLat) {
      toast.error('Unable to get precise location coordinates. Please try again.');
      return;
    }
  
    setEstimating(true);
    
    try {
      const estimateData = await rideService.getRideEstimate({
        pickupLat: explicitValues.pickupLat,
        pickupLng: explicitValues.pickupLng,
        destLat: explicitValues.destLat,
        destLng: explicitValues.destLng,
        rideType: explicitValues.rideType
      });
  
      if (estimateData.success && estimateData.estimate) {
        const estimate = estimateData.estimate;
        
        setEstimatedDistance(estimate.distance);
        setEstimatedFare(estimate.totalFare);
        setEstimatedTime(estimate.duration);
        
        toast.success(`Estimate calculated: ${estimate.distance.toFixed(1)}km, ${formatCurrency(estimate.totalFare)}`);
      } else {
        // Fallback to local calculation
        const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
  
        const distance = calculateHaversineDistance(
          explicitValues.pickupLat, 
          explicitValues.pickupLng, 
          explicitValues.destLat, 
          explicitValues.destLng
        );
        
        const localEstimate = calculateLocalEstimate(distance, Math.round(distance * 3), explicitValues.rideType);
        
        setEstimatedDistance(localEstimate.distance);
        setEstimatedFare(localEstimate.totalFare);
        setEstimatedTime(localEstimate.duration);
        
        toast.success(`Approximate estimate: ${distance.toFixed(1)}km, ${formatCurrency(localEstimate.totalFare)}`);
      }
    } catch (error: any) {
      // Use fallback
      const distance = 5.0;
      const localEstimate = calculateLocalEstimate(distance, 15, explicitValues.rideType);
      
      setEstimatedDistance(localEstimate.distance);
      setEstimatedFare(localEstimate.totalFare);
      setEstimatedTime(localEstimate.duration);
      
      toast.success('Using approximate fare calculation');
    } finally {
      setEstimating(false);
    }
  };
  
  // Update the existing calculateEstimate to also use explicit values
  const calculateEstimate = async () => {
    const values = form.getFieldsValue();
    
    if (!values.pickupLocation || !values.destination || !values.rideType) {
      return;
    }
  
    // If we're missing coordinates, try to fetch them
    if (!values.pickupLat || !values.destLat) {
      
      const coordinates = {
        pickupLat: values.pickupLat,
        pickupLng: values.pickupLng,
        destLat: values.destLat,
        destLng: values.destLng
      };
      
      // Try to get missing coordinates
      if (!values.pickupLat && values.pickupLocation) {
        const pickupData = await tryFetchCoordinates(values.pickupLocation);
        if (pickupData?.coordinates) {
          coordinates.pickupLat = pickupData.coordinates.lat;
          coordinates.pickupLng = pickupData.coordinates.lng;
          form.setFieldsValue({
            pickupLat: pickupData.coordinates.lat,
            pickupLng: pickupData.coordinates.lng
          });
        }
      }
      
      if (!values.destLat && values.destination) {
        const destData = await tryFetchCoordinates(values.destination);
        if (destData?.coordinates) {
          coordinates.destLat = destData.coordinates.lat;
          coordinates.destLng = destData.coordinates.lng;
          form.setFieldsValue({
            destLat: destData.coordinates.lat,
            destLng: destData.coordinates.lng
          });
        }
      }
      
      // Use calculateEstimateWithValues with the coordinates we have
      calculateEstimateWithValues({
        ...values,
        ...coordinates
      });
    } else {
      // We have coordinates, use calculateEstimateWithValues
      calculateEstimateWithValues(values);
    }
  };

  const handlePickupSearch = async (value: string) => {
    form.setFieldsValue({ pickupLocation: value });
    await fetchAutocompleteSuggestions(
      value, 
      setPickupSuggestions, 
      setLoadingPickupSuggestions
    );
  };

  const handleDestinationSearch = async (value: string) => {
    form.setFieldsValue({ destination: value });
    await fetchAutocompleteSuggestions(
      value, 
      setDestinationSuggestions, 
      setLoadingDestinationSuggestions
    );
  };

  const handleProceedToBook = async () => {
    try {
      const values = form.getFieldsValue();
      
      // Use coordinates from state as fallback
      const finalValues = {
        ...values,
        pickupLat: values.pickupLat || coordinates.pickupLat,
        pickupLng: values.pickupLng || coordinates.pickupLng,
        destLat: values.destLat || coordinates.destLat,
        destLng: values.destLng || coordinates.destLng
      };
  
      if (!estimatedFare || !estimatedDistance || !estimatedTime) {
        toast.error('Please calculate fare estimate first');
        return;
      }
  
      if (
        !finalValues.pickupLocation ||
        !finalValues.destination ||
        !finalValues.rideType ||
        !finalValues.phoneNumber ||
        !finalValues.pickupLat ||
        !finalValues.pickupLng ||
        !finalValues.destLat ||
        !finalValues.destLng
      ) {
        toast.error('Please ensure all location fields are properly filled');
        return;
      }
    
      const rideRequest: any = {
        pickupLocation: finalValues.pickupLocation,
        pickupLat: finalValues.pickupLat,
        pickupLng: finalValues.pickupLng,
        destination: finalValues.destination,
        destLat: finalValues.destLat,
        destLng: finalValues.destLng,
        rideType: finalValues.rideType,
        instructions: finalValues.instructions || '',
        paymentMethod: 'cash', 
        phoneNumber: finalValues.phoneNumber,
        distance: estimatedDistance,
        estimatedDuration: estimatedTime,
        totalFare: estimatedFare
      };
  
      const data = await rideService.createRide(rideRequest);
  
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to order ride');
      }  
      toast.success('Ride ordered successfully!');  
      navigate('/rides');  
    } catch (error: any) {
      toast.error(error.message || 'Failed to place ride');
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6"> 
      
      {/* Header with Gradient */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#FF6C2D] to-[#FF8C42] rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <Title level={2} className="text-white! mb-2">Book Your Ride</Title>
              <Text className="text-white/90! text-lg">
                Fast, safe, and reliable transportation
              </Text>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <SafetyOutlined className="text-white!" />
                <Text className="text-white!">Safety First</Text>
                <StarOutlined className="text-yellow-400! ml-2" />
                <Text className="text-white!">4.8 ★</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">       

        <Row gutter={[32, 32]}>
          {/* Left Panel - Form */}
          <Col xs={24} lg={16}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(changedValues) => {
                if (changedValues.pickupLocation || changedValues.destination || changedValues.rideType) {
                  calculateEstimate();
                }
              }}
            >
              <Card 
                className="shadow-sm border-0 rounded-2xl"
                bodyStyle={{ padding: '32px' }}
              >
                {/* Location Inputs */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#FF6C2D] rounded-full flex items-center justify-center mr-3">
                      <Text className="text-white! font-semibold">1</Text>
                    </div>
                    <Title level={4} className="mb-0">Pickup & Destination</Title>
                  </div>

                  <Row gutter={[16, 16]}>
                    {/* Pickup Location */}
                    <Col span={24}>
                      <Form.Item<RideFormValues>
                        name="pickupLocation"
                        rules={[{ required: true, message: 'Please enter pickup location!' }]}
                      >
                        <div className="relative flex items-center">                         
                          <AutoComplete
                            options={pickupSuggestions.map(addr => ({ 
                              value: addr,
                              label: (
                                <div className="flex items-center">
                                  <EnvironmentOutlined className="mr-2 text-gray-400" />
                                  <span>{addr}</span>
                                </div>
                              )
                            }))}
                            onSelect={handlePickupLocationSelect}
                            onSearch={handlePickupSearch}
                            className="w-full"
                            size="large"
                            notFoundContent={
                              loadingPickupSuggestions ? (
                                <div className="p-2 text-center">
                                  <LoadingOutlined className="mr-2" />
                                  Searching...
                                </div>
                              ) : null
                            }
                          >
                            <Input
                              size="large"
                              placeholder="Where are you now?"
                              className="pl-12 border-gray-300 rounded-xl hover:border-[#FF6C2D] focus:border-[#FF6C2D]"
                              style={{ height: '56px' }}
                            />
                          </AutoComplete>
                          <Button
                            type="link"
                            onClick={handleUseCurrentLocation}
                            loading={gettingCurrentLocation}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#FF6C2D] font-medium"
                          >
                            {gettingCurrentLocation ? 'Locating...' : 'Use Current'}
                          </Button>
                        </div>
                      </Form.Item>
                    </Col>

                    {/* Destination Location */}
                    <Col span={24}>
                      <Form.Item<RideFormValues>
                        name="destination"
                        rules={[{ required: true, message: 'Please enter destination!' }]}
                      >
                        <div className="relative">                       
                          <AutoComplete
                            options={destinationSuggestions.map(addr => ({ 
                              value: addr,
                              label: (
                                <div className="flex items-center">
                                  <AimOutlined className="mr-2 text-gray-400" />
                                  <span>{addr}</span>
                                </div>
                              )
                            }))}
                            onSelect={handleDestinationSelect}
                            onSearch={handleDestinationSearch}
                            className="w-full"
                            size="large"
                            notFoundContent={
                              loadingDestinationSuggestions ? (
                                <div className="p-2 text-center">
                                  <LoadingOutlined className="mr-2" />
                                  Searching...
                                </div>
                              ) : null
                            }
                          >
                            <Input
                              size="large"
                              placeholder="Where to?"
                              className="pl-12 border-gray-300 rounded-xl hover:border-[#FF6C2D] focus:border-[#FF6C2D]"
                              style={{ height: '56px' }}
                            />
                          </AutoComplete>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Hidden fields for coordinates */}
                  <Form.Item<RideFormValues> name="pickupLat" noStyle />
                  <Form.Item<RideFormValues> name="pickupLng" noStyle />
                  <Form.Item<RideFormValues> name="destLat" noStyle />
                  <Form.Item<RideFormValues> name="destLng" noStyle />
                </div>

                {/* Ride Type Selection */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#FF6C2D] rounded-full flex items-center justify-center mr-3">
                      <Text className="text-white! font-semibold">2</Text>
                    </div>
                    <Title level={4} className="mb-0">Choose Your Ride</Title>
                  </div>

                  <Form.Item<RideFormValues>
                    name="rideType"
                    rules={[{ required: true, message: 'Please select ride type!' }]}
                  >
                    <Select
                      placeholder="Select ride type"
                      size="large"
                      className="w-full rounded-xl border-gray-300"
                    >
                      {rideOptions.map(option => (
                        <Option value={option.type} key={option.type}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{option.icon}</span>
                              <div>
                                <div className="font-medium">{option.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(option.baseFare)} base</div>
                              <div className="text-xs text-gray-500">+ {formatCurrency(option.pricePerKm)}/km</div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {/* Additional Details */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#FF6C2D] rounded-full flex items-center justify-center mr-3">
                      <Text className="text-white! font-semibold">3</Text>
                    </div>
                    <Title level={4} className="mb-0">Additional Details</Title>
                  </div>

                  <Row>
                    <Col span={24}>
                      <Form.Item<RideFormValues>
                        name="phoneNumber"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter your phone number!' }]}
                      >
                        <Input
                          size="large"
                          placeholder="Enter your phone number"
                          prefix={<PhoneOutlined className="text-gray-400" />}
                          className="rounded-xl border-gray-300"
                        />
                      </Form.Item>
                    </Col>                    
                    <Col span={24}>
                      <Form.Item<RideFormValues>
                        name="instructions"
                        label="Special Instructions"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Any special instructions for the rider..."
                          className="rounded-xl border-gray-300 min-h-[100px]!"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Payment Method */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#FF6C2D] rounded-full flex items-center justify-center mr-3">
                      <Text className="text-white! font-semibold">4</Text>
                    </div>
                    <Title level={4} className="mb-0">Payment Method</Title>
                  </div>

                  <Form.Item<RideFormValues>
                    name="paymentMethod"
                    rules={[{ required: true, message: 'Please select payment method!' }]}
                  >
                    <Radio.Group className="w-full">
                      <Row gutter={[16, 16]}>
                        {paymentOptions.map(option => (
                          <Col xs={24} md={12} key={option.value}>
                            <Radio 
                              value={option.value} 
                              className="hidden"
                              disabled={!option.available}
                            >
                              <Card
                                hoverable={option.available}
                                onClick={() => option.available && form.setFieldValue('paymentMethod', option.value)}
                                className={`border-2 rounded-xl transition-all ${
                                  !option.available 
                                    ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
                                    : form.getFieldValue('paymentMethod') === option.value
                                    ? 'border-[#FF6C2D] bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className="text-2xl mr-4" style={{ color: option.color }}>
                                    {option.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <Text strong className="text-lg">
                                        {option.label}
                                      </Text>
                                    
                                      {option.badge && (
                                        <Tag color="blue" className="rounded-full">
                                          {option.badge}
                                        </Tag>
                                      )}
                                    </div>
                                    <Text className="text-gray-600 block mb-2">
                                      {option.description}
                                    </Text>                                    
                                    {option.available && (
                                      <div className="space-y-1">                                      
                                        <div className="flex items-center text-sm">
                                          <CheckCircleOutlined className="text-green-500 mr-2" />
                                          <span className="text-gray-700">No transaction fees</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </Radio>
                          </Col>
                        ))}
                      </Row>
                    </Radio.Group>
                  </Form.Item>

                  {/* Payment Information Notice */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <InfoCircleOutlined className="text-blue-500 mt-1 mr-3" />
                      <div>
                        <h2 className="text-blue-700 block mb-1">
                          Payment Information
                        </h2>
                        <p className="text-blue-600 text-sm">
                          We are currently accepting cash payments only. Online payment options will be available soon. 
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Form>
          </Col>

          {/* Right Panel - Summary */}
          <Col xs={24} lg={8}>
            <div className="sticky top-6">
              <Card 
                className="shadow-sm border-0 rounded-2xl"
                title={
                  <div className="flex items-center">
                    <CarOutlined className="text-[#FF6C2D] mr-2" />
                    <Text className="text-lg font-semibold">Ride Summary</Text>
                  </div>
                }
              >
                {estimating ? (
                  <div className="py-12 text-center">
                    <Spin size="large" indicator={<LoadingOutlined className="text-[#FF6C2D]" />} />
                    <Text className="block mt-4 text-gray-600">Calculating your fare...</Text>
                    <Progress
                      percent={75}
                      showInfo={false}
                      strokeColor="#FF6C2D"
                      className="mt-4"
                    />
                  </div>
                ) : estimatedFare !== null ? (
                  <>
                    {/* Route Visualization */}
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="flex-1 mx-4">
                          <Text strong className="text-sm">
                            {form.getFieldValue('pickupLocation') || 'Pickup location'}
                          </Text>
                        </div>
                      </div>
                      <div className="ml-2 h-6 border-l-2 border-dashed border-gray-300"></div>
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <div className="flex-1 mx-4">
                          <Text strong className="text-sm">
                            {form.getFieldValue('destination') || 'Destination'}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Ride Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <Text className="text-gray-600">Ride Type</Text>
                        <Text strong>
                          {(() => {
                            const rideType = form.getFieldValue('rideType');
                            return rideOptions.find(r => r.type === rideType)?.name || 'Not selected';
                          })()}
                        </Text>
                      </div>
                      {estimatedDistance && (
                        <div className="flex items-center justify-between">
                          <Text className="text-gray-600">Distance</Text>
                          <Text strong>{estimatedDistance.toFixed(1)} km</Text>
                        </div>
                      )}
                      {estimatedTime && (
                        <div className="flex items-center justify-between">
                          <Text className="text-gray-600">Estimated Time</Text>
                          <div className="flex items-center">
                            <ClockCircleOutlined className="mr-2 text-gray-400" />
                            <Text strong>{estimatedTime} min</Text>
                          </div>
                        </div>
                      )}
                      
                    </div>

                    <Divider />

                    {/* Fare Breakdown - Updated to show Naira */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <Text className="text-md font-semibold">Total Fare</Text>
                        <Title level={3} className="text-[#10B981] mb-0">
                          {estimatedFare ? formatCurrency(estimatedFare) : '₦0'}
                        </Title>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <Text className="text-gray-600">Base fare</Text>
                          <Text>{estimatedFare ? formatCurrency(estimatedFare * 0.7) : '₦0'}</Text>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <Text className="text-gray-600">Distance</Text>
                          <Text>{estimatedFare ? formatCurrency(estimatedFare * 0.2) : '₦0'}</Text>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <Text className="text-gray-600">Service fee</Text>
                          <Text>{estimatedFare ? formatCurrency(estimatedFare * 0.1) : '₦0'}</Text>
                        </div>
                      </div>
                    </div>

                   

                    {/* CTA Button */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      className="w-full h-12 bg-gradient-to-r from-[#FF6C2D] to-[#FF8C42] border-0 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                      onClick={handleProceedToBook}
                      disabled={!estimatedFare}
                    >
                      Click to proceed
                    </Button>

                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <CompassOutlined className="text-3xl text-gray-400" />
                    </div>
                    <Text className="block text-gray-600 mb-2">Enter ride details</Text>
                    <Text className="block text-gray-500 text-sm">
                      Fill in pickup and destination to see fare estimate
                    </Text>
                  </div>
                )}
              </Card>

    

              {/* Safety Features Card */}
              <Card className="mt-4! shadow border-0 rounded-2xl">
                <div className="flex items-center mb-3">
                  <SafetyOutlined className="text-[#10B981] mr-2" />
                  <Text strong>Safety Features</Text>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Text className="text-green-600 text-xs">✓</Text>
                    </div>
                    <Text className="text-sm">Contactless rides available</Text>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Text className="text-green-600 text-xs">✓</Text>
                    </div>
                    <Text className="text-sm">Rider background checks</Text>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OrderRide;