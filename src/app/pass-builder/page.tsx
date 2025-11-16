'use client';

import React, { useState } from 'react';
import { Download, Plus, Minus, QrCode, MapPin, Calendar, Settings, Eye, Copy } from 'lucide-react';

interface PassField {
  key: string;
  label?: string;
  value: string;
  changeMessage?: string;
  textAlignment?: string;
}

interface PassLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  relevantText?: string;
}

interface PassBarcode {
  message: string;
  format: string;
  messageEncoding?: string;
  altText?: string;
}

const PassBuilder = () => {
  const [passType, setPassType] = useState<string>('generic');
  const [transitType, setTransitType] = useState<string>('');
  const [description, setDescription] = useState<string>('My Custom Pass');
  const [organizationName, setOrganizationName] = useState<string>('HushOne, Inc.');
  const [logoText, setLogoText] = useState<string>('HUSHH');
  
  // Visual Design
  const [backgroundColor, setBackgroundColor] = useState<string>('#754110');
  const [foregroundColor, setForegroundColor] = useState<string>('#FFF8EB');
  const [labelColor, setLabelColor] = useState<string>('#D8B26F');
  
  // Fields
  const [primaryFields, setPrimaryFields] = useState<PassField[]>([
    { key: 'name', label: 'Name', value: 'John Doe' }
  ]);
  const [secondaryFields, setSecondaryFields] = useState<PassField[]>([]);
  const [auxiliaryFields, setAuxiliaryFields] = useState<PassField[]>([]);
  const [headerFields, setHeaderFields] = useState<PassField[]>([]);
  const [backFields, setBackFields] = useState<PassField[]>([
    { key: 'info', label: 'Information', value: 'Additional details about this pass' }
  ]);
  
  // Barcode/QR
  const [hasBarcode, setHasBarcode] = useState<boolean>(true);
  const [barcode, setBarcode] = useState<PassBarcode>({
    message: 'SAMPLE123456',
    format: 'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1'
  });
  
  // Location
  const [hasLocation, setHasLocation] = useState<boolean>(false);
  const [locations, setLocations] = useState<PassLocation[]>([]);
  
  // Dates
  const [relevantDate, setRelevantDate] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  
  // Advanced
  const [webServiceURL, setWebServiceURL] = useState<string>('');
  const [authenticationToken, setAuthenticationToken] = useState<string>('');
  const [sharingProhibited, setSharingProhibited] = useState<boolean>(false);
  
  // Loading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string>('');

  const addField = (
    fields: PassField[], 
    setFields: React.Dispatch<React.SetStateAction<PassField[]>>
  ) => {
    const newField: PassField = {
      key: `field_${Date.now()}`,
      label: 'New Field',
      value: 'Value'
    };
    setFields([...fields, newField]);
  };

  const updateField = (
    index: number,
    fields: PassField[],
    setFields: React.Dispatch<React.SetStateAction<PassField[]>>,
    updates: Partial<PassField>
  ) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (
    index: number,
    fields: PassField[],
    setFields: React.Dispatch<React.SetStateAction<PassField[]>>
  ) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addLocation = () => {
    const newLocation: PassLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      relevantText: 'Location notification'
    };
    setLocations([...locations, newLocation]);
  };

  const updateLocation = (index: number, updates: Partial<PassLocation>) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], ...updates };
    setLocations(newLocations);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const generatePass = async () => {
    setIsGenerating(true);
    try {
      const passData = {
        passType,
        ...(passType === 'boardingPass' && transitType && { transitType }),
        description,
        organizationName,
        logoText,
        backgroundColor: `rgb(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(backgroundColor.slice(3, 5), 16)}, ${parseInt(backgroundColor.slice(5, 7), 16)})`,
        foregroundColor: `rgb(${parseInt(foregroundColor.slice(1, 3), 16)}, ${parseInt(foregroundColor.slice(3, 5), 16)}, ${parseInt(foregroundColor.slice(5, 7), 16)})`,
        labelColor: `rgb(${parseInt(labelColor.slice(1, 3), 16)}, ${parseInt(labelColor.slice(3, 5), 16)}, ${parseInt(labelColor.slice(5, 7), 16)})`,
        
        primaryFields,
        secondaryFields,
        auxiliaryFields,
        headerFields,
        backFields,
        
        ...(hasBarcode && { barcode }),
        ...(hasLocation && locations.length > 0 && { locations }),
        ...(relevantDate && { relevantDate }),
        ...(expirationDate && { expirationDate }),
        ...(webServiceURL && authenticationToken && {
          webServiceURL,
          authenticationToken
        }),
        sharingProhibited
      };

      const response = await fetch('/api/passes/universal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setLastGeneratedUrl(url);
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `CustomPass-${Date.now()}.pkpass`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`Pass generation failed: ${error.details}`);
      }
    } catch (error) {
      console.error('Error generating pass:', error);
      alert('Pass generation failed. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyApiCall = () => {
    const passData = {
      passType,
      description,
      primaryFields,
      ...(hasBarcode && { barcode })
    };

    const curlCommand = `curl -X POST "${window.location.origin}/api/passes/universal/create" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(passData, null, 2)}' \\
  -o "my-pass.pkpass"`;

    navigator.clipboard.writeText(curlCommand);
    alert('API call copied to clipboard!');
  };

  const loadTemplate = (templateNumber: number) => {
    switch (templateNumber) {
      case 1: // Generic ID Card
        setPassType('generic');
        setDescription('Personal ID Card');
        setOrganizationName('HushOne, Inc.');
        setLogoText('HUSHH');
        setBackgroundColor('#754110');
        setForegroundColor('#FFF8EB');
        setLabelColor('#D8B26F');
        setPrimaryFields([
          { key: 'name', label: 'Full Name', value: 'John Doe' }
        ]);
        setSecondaryFields([
          { key: 'id', label: 'ID Number', value: 'HU123456' },
          { key: 'type', label: 'Type', value: 'Premium' }
        ]);
        setAuxiliaryFields([
          { key: 'issued', label: 'Issued', value: new Date().toLocaleDateString() },
          { key: 'expires', label: 'Expires', value: '2025-12-31' }
        ]);
        setBackFields([
          { key: 'info', label: 'Information', value: 'This is your personal identification card for secure access and verification.' },
          { key: 'support', label: 'Support', value: 'Contact support@hushh.ai for assistance' }
        ]);
        setBarcode({ message: 'HU123456789', format: 'PKBarcodeFormatQR', messageEncoding: 'iso-8859-1' });
        setHasBarcode(true);
        setHasLocation(false);
        setLocations([]);
        break;

      case 2: // Airline Boarding Pass
        setPassType('boardingPass');
        setTransitType('PKTransitTypeAir');
        setDescription('Flight Boarding Pass');
        setOrganizationName('SkyLine Airways');
        setLogoText('SKY');
        setBackgroundColor('#004B9B');
        setForegroundColor('#FFFFFF');
        setLabelColor('#C8C8C8');
        setPrimaryFields([
          { key: 'origin', value: 'NYC' },
          { key: 'destination', value: 'LAX' }
        ]);
        setSecondaryFields([
          { key: 'flight', label: 'Flight', value: 'SK789' },
          { key: 'gate', label: 'Gate', value: 'B12' },
          { key: 'seat', label: 'Seat', value: '15A' }
        ]);
        setAuxiliaryFields([
          { key: 'boarding', label: 'Boarding', value: '2:45 PM' },
          { key: 'departure', label: 'Departure', value: '3:15 PM' }
        ]);
        setBackFields([
          { key: 'confirmation', label: 'Confirmation', value: 'ABC123DEF' },
          { key: 'baggage', label: 'Baggage', value: 'Checked: 1 bag (23kg)' },
          { key: 'meal', label: 'Meal', value: 'Vegetarian meal pre-selected' }
        ]);
        setBarcode({ message: 'SK789NYCLAX20241215ABC123', format: 'PKBarcodeFormatPDF417', altText: 'Boarding Pass SK789' });
        setHasBarcode(true);
        setHasLocation(true);
        setLocations([{ latitude: 40.6413, longitude: -73.7781, relevantText: 'Flight SK789 boarding at Gate B12' }]);
        break;

      case 3: // Event Ticket
        setPassType('eventTicket');
        setDescription('Tech Conference 2024');
        setOrganizationName('Tech Events Co.');
        setLogoText('TECH24');
        setBackgroundColor('#1A1A2E');
        setForegroundColor('#FFFFFF');
        setLabelColor('#16213E');
        setPrimaryFields([
          { key: 'event', value: 'TechConf 2024' }
        ]);
        setSecondaryFields([
          { key: 'attendee', label: 'Attendee', value: 'John Developer' },
          { key: 'ticket', label: 'Ticket', value: 'VIP Pass' }
        ]);
        setAuxiliaryFields([
          { key: 'date', label: 'Date', value: 'Dec 20-22, 2024' },
          { key: 'venue', label: 'Venue', value: 'Convention Center' }
        ]);
        setBackFields([
          { key: 'schedule', label: 'Schedule', value: 'Day 1: Keynotes 9AM\nDay 2: Workshops 10AM\nDay 3: Networking 2PM' },
          { key: 'wifi', label: 'WiFi Access', value: 'Network: TechConf24\nPassword: innovation2024' },
          { key: 'contact', label: 'Event Contact', value: 'info@techconf24.com\n+1-555-TECH-CONF' }
        ]);
        setBarcode({ message: 'TECHCONF2024VIP001', format: 'PKBarcodeFormatQR', altText: 'Event Ticket TC24001' });
        setHasBarcode(true);
        setHasLocation(true);
        setLocations([{ latitude: 37.7749, longitude: -122.4194, relevantText: 'Welcome to TechConf 2024!' }]);
        break;

      case 4: // Store Loyalty Card
        setPassType('storeCard');
        setDescription('Coffee Shop Loyalty');
        setOrganizationName('Bean & Brew Co.');
        setLogoText('B&B');
        setBackgroundColor('#8B4513');
        setForegroundColor('#F5F5DC');
        setLabelColor('#DEB887');
        setPrimaryFields([
          { key: 'points', label: 'Points', value: '1,250' }
        ]);
        setSecondaryFields([
          { key: 'member', label: 'Member', value: 'Gold Status' },
          { key: 'visits', label: 'Visits', value: '47' }
        ]);
        setAuxiliaryFields([
          { key: 'nextReward', label: 'Next Reward', value: '250 pts = Free Latte' },
          { key: 'member_since', label: 'Member Since', value: 'Jan 2023' }
        ]);
        setBackFields([
          { key: 'rewards', label: 'Rewards Program', value: 'Earn 10 points per $1 spent. 500 points = $5 reward.' },
          { key: 'locations', label: 'Locations', value: 'Downtown, Mall Plaza, Airport Terminal' },
          { key: 'hours', label: 'Hours', value: 'Mon-Fri: 6AM-9PM\nWeekends: 7AM-10PM' }
        ]);
        setBarcode({ message: 'BB123456789', format: 'PKBarcodeFormatCode128', altText: 'Loyalty Card BB123456789' });
        setHasBarcode(true);
        setHasLocation(true);
        setLocations([{ latitude: 40.7580, longitude: -73.9855, relevantText: 'Earn double points today at Bean & Brew!' }]);
        break;

      case 5: // Discount Coupon
        setPassType('coupon');
        setDescription('25% Off Everything');
        setOrganizationName('Fashion Store');
        setLogoText('FASHION');
        setBackgroundColor('#E91E63');
        setForegroundColor('#FFFFFF');
        setLabelColor('#F8BBD0');
        setPrimaryFields([
          { key: 'discount', value: '25% OFF' }
        ]);
        setSecondaryFields([
          { key: 'code', label: 'Code', value: 'SAVE25' },
          { key: 'valid', label: 'Valid Until', value: 'Dec 31, 2024' }
        ]);
        setAuxiliaryFields([
          { key: 'min_purchase', label: 'Min Purchase', value: '$50' },
          { key: 'category', label: 'Category', value: 'All Items' }
        ]);
        setBackFields([
          { key: 'terms', label: 'Terms & Conditions', value: 'Valid for in-store and online purchases. Cannot be combined with other offers. Excludes sale items.' },
          { key: 'store_info', label: 'Store Information', value: 'Fashion Store - Premium clothing and accessories' }
        ]);
        setBarcode({ message: 'SAVE25FASHION2024', format: 'PKBarcodeFormatQR', altText: 'Coupon Code SAVE25' });
        setHasBarcode(true);
        setHasLocation(false);
        setLocations([]);
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + 1);
        setExpirationDate(expDate.toISOString().slice(0, 16));
        break;
    }
  };

  const FieldEditor = ({ 
    title, 
    fields, 
    setFields 
  }: { 
    title: string; 
    fields: PassField[]; 
    setFields: React.Dispatch<React.SetStateAction<PassField[]>> 
  }) => (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <button
          onClick={() => addField(fields, setFields)}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
      
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={(e) => updateField(index, fields, setFields, { key: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Label"
              value={field.label || ''}
              onChange={(e) => updateField(index, fields, setFields, { label: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Value"
              value={field.value}
              onChange={(e) => updateField(index, fields, setFields, { value: e.target.value })}
              className="flex-2 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={() => removeField(index, fields, setFields)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Minus size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apple Wallet Pass Builder</h1>
              <p className="text-gray-600 mt-2">Create custom Apple Wallet passes with all features</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyApiCall}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <Copy size={16} />
                Copy API Call
              </button>
              <button
                onClick={generatePass}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download size={16} />
                )}
                {isGenerating ? 'Generating...' : 'Generate Pass'}
              </button>
            </div>
          </div>
        </div>

        {/* Template Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Start Templates</h3>
              <p className="text-sm text-gray-600">Pre-filled templates to get started quickly</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <button
              onClick={() => loadTemplate(1)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">Option 1: ID Card</div>
              <div className="text-sm text-gray-600 mt-1">Generic personal ID card with QR code</div>
            </button>
            
            <button
              onClick={() => loadTemplate(2)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">Option 2: Flight Pass</div>
              <div className="text-sm text-gray-600 mt-1">Airline boarding pass with location</div>
            </button>
            
            <button
              onClick={() => loadTemplate(3)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">Option 3: Event Ticket</div>
              <div className="text-sm text-gray-600 mt-1">Conference ticket with venue info</div>
            </button>
            
            <button
              onClick={() => loadTemplate(4)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">Option 4: Loyalty Card</div>
              <div className="text-sm text-gray-600 mt-1">Coffee shop loyalty with points</div>
            </button>
            
            <button
              onClick={() => loadTemplate(5)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">Option 5: Coupon</div>
              <div className="text-sm text-gray-600 mt-1">Discount coupon with expiry</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pass Type</label>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="generic">Generic</option>
                    <option value="boardingPass">Boarding Pass</option>
                    <option value="coupon">Coupon</option>
                    <option value="eventTicket">Event Ticket</option>
                    <option value="storeCard">Store Card</option>
                  </select>
                </div>

                {passType === 'boardingPass' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transit Type</label>
                    <select
                      value={transitType}
                      onChange={(e) => setTransitType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select transit type</option>
                      <option value="PKTransitTypeAir">Air</option>
                      <option value="PKTransitTypeBus">Bus</option>
                      <option value="PKTransitTypeTrain">Train</option>
                      <option value="PKTransitTypeBoat">Boat</option>
                      <option value="PKTransitTypeGeneric">Generic</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Visual Design */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Design</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label Color</label>
                  <input
                    type="color"
                    value={labelColor}
                    onChange={(e) => setLabelColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* QR Code Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <QrCode size={20} />
                <h3 className="text-lg font-semibold text-gray-900">QR Code / Barcode</h3>
                <label className="ml-auto flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasBarcode}
                    onChange={(e) => setHasBarcode(e.target.checked)}
                    className="rounded"
                  />
                  Enable
                </label>
              </div>

              {hasBarcode && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode Format</label>
                    <select
                      value={barcode.format}
                      onChange={(e) => setBarcode({ ...barcode, format: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PKBarcodeFormatQR">QR Code</option>
                      <option value="PKBarcodeFormatPDF417">PDF417</option>
                      <option value="PKBarcodeFormatAztec">Aztec</option>
                      <option value="PKBarcodeFormatCode128">Code128</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <input
                      type="text"
                      value={barcode.message}
                      onChange={(e) => setBarcode({ ...barcode, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Fields & Advanced */}
          <div className="space-y-6">
            {/* Pass Fields */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass Fields</h3>
              
              <div className="space-y-4">
                <FieldEditor title="Primary Fields (Large display)" fields={primaryFields} setFields={setPrimaryFields} />
                <FieldEditor title="Secondary Fields" fields={secondaryFields} setFields={setSecondaryFields} />
                <FieldEditor title="Auxiliary Fields" fields={auxiliaryFields} setFields={setAuxiliaryFields} />
                <FieldEditor title="Header Fields" fields={headerFields} setFields={setHeaderFields} />
                <FieldEditor title="Back Fields" fields={backFields} setFields={setBackFields} />
              </div>
            </div>

            {/* Location Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Location Notifications</h3>
                <label className="ml-auto flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasLocation}
                    onChange={(e) => setHasLocation(e.target.checked)}
                    className="rounded"
                  />
                  Enable
                </label>
              </div>

              {hasLocation && (
                <div className="space-y-4">
                  <button
                    onClick={addLocation}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <Plus size={14} />
                    Add Location
                  </button>

                  {locations.map((location, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={location.latitude}
                          onChange={(e) => updateLocation(index, { latitude: parseFloat(e.target.value) })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={location.longitude}
                          onChange={(e) => updateLocation(index, { longitude: parseFloat(e.target.value) })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Notification text"
                        value={location.relevantText || ''}
                        onChange={(e) => updateLocation(index, { relevantText: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                      />
                      <button
                        onClick={() => removeLocation(index)}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Date Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Date</label>
                  <input
                    type="datetime-local"
                    value={relevantDate}
                    onChange={(e) => setRelevantDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Web Service URL</label>
                  <input
                    type="url"
                    value={webServiceURL}
                    onChange={(e) => setWebServiceURL(e.target.value)}
                    placeholder="https://example.com/wallet-service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Token</label>
                  <input
                    type="text"
                    value={authenticationToken}
                    onChange={(e) => setAuthenticationToken(e.target.value)}
                    placeholder="Your auth token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sharingProhibited}
                    onChange={(e) => setSharingProhibited(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Prohibit sharing</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Universal Apple Wallet Pass Builder</h3>
              <p className="text-sm text-gray-600 mt-1">
                Complete API support for all Apple Wallet features including QR codes, locations, notifications, and custom styling
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">API Endpoint</div>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">/api/passes/universal/create</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassBuilder;
