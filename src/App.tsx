import React, { useState, useEffect } from 'react';
import { Car, Calendar, Users, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/fr.js';
import 'flatpickr/dist/themes/airbnb.css';
import { French } from 'flatpickr/dist/l10n/fr.js';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Toaster, toast } from 'react-hot-toast';

// Import data files
import RENTAL_COUNTRIES from './liste-pays.json';
import vehicles from './liste_vehicules_images.json';
import stations from './resultatsStations.json';

// Slider arrows components
const PrevArrow = (props: any) => (
  <button
    {...props}
    type="button"
    onClick={(e) => {
      e.preventDefault(); 
      props.onClick && props.onClick(e);
    }}
    className="slick-prev z-30 absolute left-1 md:left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center"
    aria-label="Précédent"
  >
    <div className="text-black text-3xl leading-none bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white">
      ‹
    </div>
  </button>
);

const NextArrow = (props: any) => (
  <button
    {...props}
    type="button"
    onClick={(e) => {
       e.preventDefault();
       props.onClick && props.onClick(e);
    }}
    className="slick-next z-30 absolute right-1 md:right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center"
    aria-label="Suivant"
  >
    <div className="text-black text-3xl leading-none bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white">
      ›
    </div>
  </button>
);

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  swipeToSlide: true,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        dots: false
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        dots: false
      }
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        dots: false,
        swipe: true,
        touchMove: true
      }
    }
  ]
};

const formatStationName = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.startsWith("red_")) {
    let cleaned = lower.slice(4);
    cleaned = cleaned.replace(/\b(airport|apt|ap)\b/gi, "");
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return `aeroport de ${cleaned}`;
  }
  return name;
};

// Function to generate time options every 30 minutes
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};
const timeOptions = generateTimeOptions();

function CarRentalForm() {
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(?:\+|00)?[0-9\s()\-]{10,}$/;
    return phoneRegex.test(phone);
  };
  
  const [crmSubmitted, setCrmSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Car rental states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    country: '',
    station: '',
    pickupDate: '',
    pickupTime: '09:00', 
    returnDate: '',
    returnTime: '09:00',
    driverAge: '25+',
    hasVisa: false,
    shabbatRestriction: false,
    promoCode: '',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<{ "Nom du véhicule": string; "Image URL": string } | null>(null);

  // Filtered stations based on selected country
  const selectedCountry = RENTAL_COUNTRIES.find(country => country.Item1 === formData.country);
  const stationsToDisplay = selectedCountry ? stations[selectedCountry.Item2 as keyof typeof stations]?.data || [] : [];
  const visaLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg";

  // Effect to handle window resize for responsive Flatpickr options
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [whatsappLink, setWhatsappLink] = useState('');
  
  // Step validation functions
  const validateStep1 = () => {
    return formData.country && formData.station && formData.pickupDate && formData.returnDate && formData.pickupTime && formData.returnTime && formData.driverAge;
  };

  const validateStep2 = () => {
    return true; // Vehicle selection is optional for now
  };

  const validateFinalStep = () => {
    return formData.firstName && formData.lastName && formData.email && isValidPhoneNumber(formData.phone);
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    const selectedStationObject = stationsToDisplay.find(s => s.Item1 === formData.station);
    const stationName = selectedStationObject ? formatStationName(selectedStationObject.Item2) : formData.station;
    
    let message = `Location Voiture:\n
Pays: ${formData.country}\n
Station: ${stationName}\n
Dates: Du ${formData.pickupDate} ${formData.pickupTime} au ${formData.returnDate} ${formData.returnTime}\n
Âge conducteur: ${formData.driverAge}\n
Visa Premier: ${formData.hasVisa ? 'Oui' : 'Non'}\n
Restriction Shabbat: ${formData.shabbatRestriction ? 'Oui' : 'Non'}\n`;
    
    if (selectedVehicle) {
      message += `\nVéhicule sélectionné: ${selectedVehicle["Nom du véhicule"]}\n`;
    }
    
    message += `\nContact:\n
Nom: ${formData.firstName} ${formData.lastName}\n
Email: ${formData.email}\n
Téléphone: ${formData.phone}`;
    
    if (formData.notes) {
      message += `\nNotes: ${formData.notes}`;
    }

    return message;
  };

  // Function to generate WhatsApp link
  const generateWhatsAppLink = () => {
    const message = generateWhatsAppMessage();
    const phoneNumber = "972584140489";
    const encodedMessage = encodeURIComponent(message);
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile 
      ? `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
  };

  // CRM submit function
  const handleCRMSubmit = async () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      notes,
      hasVisa,
      shabbatRestriction,
      driverAge,
      country,
    } = formData;
      
    // Convert age to valid format for CRM
    let ageValue = driverAge;
    if (driverAge === "25+") {
      ageValue = "25";
    }
      
    try {
      // Create Contact
      const contactRes = await fetch('/api/createContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          preferences_client: notes,
          le_v_hicule_ne_roule_pas_le_chabat: shabbatRestriction,
          avez_vous_une_visa_premi_re_: hasVisa,
          age: ageValue,
          nationalite: "Francais"
        })
      });
      
      const contactData = await contactRes.json();
      if (!contactRes.ok) throw new Error(`Erreur création contact: ${contactData.detail}`);
      const contactId = contactData.contactId;

      // Helper function to format dd/mm/yyyy to yyyy-mm-dd
      const formatDDMMYYYYToYYYYMMDD = (dateStr: string | null | undefined): string | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };

      // Prepare Car Deal Payload
      const selectedStationObject = stationsToDisplay.find(s => s.Item1 === formData.station);
      const stationName = selectedStationObject ? selectedStationObject.Item2 : formData.station;

      const dealPayload = {
        contactId,
        firstName,
        lastName,
        activeTab: 'car',
        selectedVehicle,
        stationName: stationName,
        check_in_date_str: formatDDMMYYYYToYYYYMMDD(formData.pickupDate),
        check_out_date_str: formatDDMMYYYYToYYYYMMDD(formData.returnDate),
        pickupTime: formData.pickupTime,
        returnTime: formData.returnTime,
        driverAge: formData.driverAge,
        hasVisa: formData.hasVisa,
        shomer_shabbat: formData.shabbatRestriction
      };

      // Create Deal
      const dealRes = await fetch('/api/createDeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealPayload)
      });
      
      const dealData = await dealRes.json();
      if (!dealRes.ok) throw new Error(`Erreur création deal: ${dealData.detail}`);
    } catch (error) {
      console.error('Error submitting to CRM:', error);
    }
  };

  // Handle WhatsApp submission
  const handleOpenWhatsApp = async () => {
    if (!validateFinalStep() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate WhatsApp link
      const whatsappUrl = generateWhatsAppLink();
      
      // Open WhatsApp directly
      window.open(whatsappUrl, '_blank');
      
      // Reset states
      setCurrentStep(1);
      setFormSubmitted(true);
      setWhatsappLink(whatsappUrl);
      
      // Success notification
      toast.success("WhatsApp a été ouvert pour finaliser votre demande !");
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données ou de l\'ouverture de WhatsApp:', error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit to CRM when contact info is complete
  useEffect(() => {
    if (validateFinalStep() && !crmSubmitted) {
      console.log("Contact info complete with valid phone - submitting to CRM once");
      setCrmSubmitted(true);
      handleCRMSubmit();
    }
  }, [formData.firstName, formData.lastName, formData.email, formData.phone, crmSubmitted]);

  // Render contact info step (for step 3)
  const renderContactInfoStep = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input type="text" className="p-3 border rounded-lg" placeholder="Prénom *" value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
        <input type="text" className="p-3 border rounded-lg" placeholder="Nom *" value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input type="email" className="p-3 border rounded-lg" placeholder="Email *" value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type="tel" className="p-3 border rounded-lg" placeholder="Téléphone *" value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
      </div>
      <div className="mb-6">
        <textarea className="w-full p-3 border rounded-lg" placeholder="Notes ou remarques (facultatif)"
          value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
      </div>
    </>
  );

  // Render step content based on current step
  const renderStepContent = () => {
    if (currentStep === 1) {
      // Car Step 1: Location, Dates, Options
      return (
        <>
          {/* Country/Station/Dates/Times Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 md:gap-4 mb-6 items-end">
            {/* Country */}
            <div className="sm:col-span-1 md:col-span-1">
              <select id="country-select" className="w-full p-3 border rounded-lg text-sm md:text-base" value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value, station: ''})} required>
                <option value="">Pays *</option>
                {RENTAL_COUNTRIES.sort((a, b) => ['Israel', 'France', 'États-Unis'].includes(b.Item2) ? 1 : -1)
                  .map((country) => (<option key={country.Item1} value={country.Item1}>{country.Item2}</option>))}
              </select>
            </div>
            {/* Station */}
            <div className="sm:col-span-1 md:col-span-2">
              <select id="station-select" className="w-full p-3 border rounded-lg text-sm md:text-base" value={formData.station}
                onChange={(e) => setFormData({...formData, station: e.target.value})} required disabled={!formData.country}>
                <option value="">Station *</option>
                {stationsToDisplay.map(station => (
                  <option key={station.Item1} value={station.Item1} className={station.Item2.startsWith("red_") ? 'text-red-600' : ''}>
                    {formatStationName(station.Item2)}
                  </option>
                ))}
              </select>
            </div>
            {/* Dates */}
            <div className="relative sm:col-span-2 md:col-span-2">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <div className="w-full pl-10 pr-4 py-3 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent relative">
                <Flatpickr
                  options={{
                    mode: "range", locale: French, minDate: "today", showMonths: 1,
                    dateFormat: "d/m/Y",
                    static: false,
                    disableMobile: false
                  }}
                  className="w-full flatpickr-input bg-transparent outline-none text-sm md:text-base border-none"
                  placeholder="Dates Prise/Retour*"
                  value={formData.pickupDate && formData.returnDate ? [formData.pickupDate, formData.returnDate] : []}
                  onChange={(selectedDates) => {
                    if (selectedDates.length === 2) {
                      setFormData({ ...formData, pickupDate: selectedDates[0].toLocaleDateString('fr-FR'), returnDate: selectedDates[1].toLocaleDateString('fr-FR') });
                    } else if (selectedDates.length === 0) {
                       setFormData({ ...formData, pickupDate: '', returnDate: '' });
                    }
                  }}
                  required
                />
              </div>
            </div>
            {/* Time Pickers */}
            <div className="col-span-1 sm:col-span-2 md:col-span-2 flex flex-row gap-2 md:gap-4">
              {/* Pickup Time */}
              <div className="relative flex-1">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
                 <select
                   id="pickupTime"
                   className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm md:text-base appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   value={formData.pickupTime}
                   onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                   required
                 >
                   <option value="">HH:MM *</option>
                   {timeOptions.map(time => (
                     <option key={time} value={time}>{time}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                   <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              {/* Return Time */}
              <div className="relative flex-1">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
                 <select
                   id="returnTime"
                   className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm md:text-base appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   value={formData.returnTime}
                   onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                   required
                 >
                   <option value="">HH:MM *</option>
                   {timeOptions.map(time => (
                     <option key={time} value={time}>{time}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                   <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-start">
            {/* Visa / Shabbat Options */}
            <div className="flex flex-row gap-3 md:col-span-2">
              <button type="button" onClick={() => setFormData({ ...formData, hasVisa: !formData.hasVisa })}
                className={`flex items-center gap-2 p-3 border rounded-lg transition-colors w-full justify-center text-sm ${formData.hasVisa ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>
                <img src={visaLogoUrl} alt="Visa Logo" className="w-8 h-auto hidden sm:block" />
                <span>J'ai une Visa Première</span>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, shabbatRestriction: !formData.shabbatRestriction })}
                className={`flex items-center gap-2 p-3 border rounded-lg transition-colors w-full justify-center text-sm ${formData.shabbatRestriction ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>
                <img src="/chabbat.png" alt="Shabbat" className="w-8 h-auto hidden sm:block" />
                <span>Je roule pas Chabbat</span>
              </button>
            </div>
            {/* Driver Age and Promo Code */}
            <div className="flex flex-row gap-3 md:col-span-2">
              {/* Driver Age */}
              <div className="flex-1 md:w-1/2 flex items-center gap-2">
                <label htmlFor="driverAge" className="text-sm font-medium text-gray-700 text-center">Âge du conducteur</label>
                <select id="driverAge" name="age" className="w-full p-3 border rounded-lg" value={formData.driverAge}
                onChange={(e) => setFormData({...formData, driverAge: e.target.value})} required>
                <option value="">Âge conducteur*</option>
                {Array.from({ length: 8 }, (_, i) => (<option key={i} value={i + 18}>{i + 18}</option>))}
                <option value="25+">25+</option>
                </select>
              </div>
              {/* Promo Code */}
              <div className="flex-1 md:w-1/2">
                <input id="promoCode" type="text" placeholder="Code promo"
                  className="w-full p-2 border rounded-md"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                 />
              </div>
            </div>
          </div>
        </>
      );
    } else if (currentStep === 2) {
      // Car Step 2: Vehicle Selection
      return (
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-4">Sélectionnez votre véhicule</h3>
          <Slider {...sliderSettings}>
            {vehicles.map((vehicle, index) => (
              <div key={index} className="px-2">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedVehicle?.["Nom du véhicule"] === vehicle["Nom du véhicule"] ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'}`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <img src={vehicle["Image URL"]} alt={vehicle["Nom du véhicule"]} className="w-full h-32 object-contain mb-2 rounded" />
                  <p className="text-center font-medium text-sm">{vehicle["Nom du véhicule"]}</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      );
    } else if (currentStep === 3) {
      // Car Step 3: Contact Information
      return renderContactInfoStep();
    }
    return null;
  };

  // Calculate navigation button states
  const canGoNext = (currentStep === 1 && validateStep1()) || (currentStep === 2 && validateStep2());
  const isFinalStep = currentStep === 3;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-2 md:pt-4 pb-10">
      <div className="w-full max-w-screen-xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Toaster position="top-center" />
          
          {/* Title */}
          <div className="mb-6 flex items-center gap-2">
            <Car size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold">Louer un véhicule</h1>
          </div>
  
          {/* Success Message */}
          {formSubmitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-md text-center">
              <p className="font-semibold">Merci ! Votre demande a été envoyée.</p>
              <p className="text-sm">Nous vous contacterons bientôt.</p>
              
              {/* WhatsApp Button */}
              <div className="mt-4">
                <p className="mb-2 text-sm">Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp et confirmer votre demande :</p>
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Ouvrir WhatsApp
                </a>
                
                {/* Alternative links container */}
                <div id="whatsapp-links-container" className="mt-2"></div>
              </div>
              
              {/* Reset button */}
              <button 
                onClick={() => { 
                  setFormSubmitted(false); 
                  setCurrentStep(1);
                  setWhatsappLink('');
                }} 
                className="mt-4 text-sm text-blue-600 underline"
              >
                Faire une nouvelle demande
              </button>
            </div>
          )}
  
          {!formSubmitted && (
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step indicators */}
              <div className="flex mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1">
                    <div className={`h-2 ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-200'} 
                      ${step === 1 ? 'rounded-l-full' : ''} 
                      ${step === 3 ? 'rounded-r-full' : ''}`}>
                    </div>
                    <div className="text-xs text-center mt-1">
                      {step === 1 ? 'Informations' : step === 2 ? 'Véhicule' : 'Contact'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step content */}
              {renderStepContent()}
  
              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t">
                {/* Back button */}
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className={`flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-opacity ${currentStep > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  disabled={currentStep <= 1}
                >
                   <ArrowLeft size={16} /> Précédent
                </button>
  
                {/* Next/Submit button */}
                {isFinalStep ? (
                  <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  disabled={!validateFinalStep() || isSubmitting}
                  onClick={handleOpenWhatsApp}
                  >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {isSubmitting ? 'Ouverture de WhatsApp...' : 'Envoyer la demande'}
                  </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={!canGoNext || isSubmitting}
                >
                  Suivant <ArrowRight size={16} />
                </button>
              )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarRentalForm;