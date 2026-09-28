import React, { useState } from 'react';
import { Input, Select } from 'antd';

const { Option } = Select;

// Liste complète des pays avec indicatifs et drapeaux
const COUNTRY_CODES = [
  { code: '+93', flag: '🇦🇫', country: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', country: 'Albania' },
  { code: '+213', flag: '🇩🇿', country: 'Algeria' },
  { code: '+376', flag: '🇦🇩', country: 'Andorra' },
  { code: '+244', flag: '🇦🇴', country: 'Angola' },
  { code: '+54', flag: '🇦🇷', country: 'Argentina' },
  { code: '+374', flag: '🇦🇲', country: 'Armenia' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+43', flag: '🇦🇹', country: 'Austria' },
  { code: '+994', flag: '🇦🇿', country: 'Azerbaijan' },
  { code: '+973', flag: '🇧🇭', country: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+375', flag: '🇧🇾', country: 'Belarus' },
  { code: '+32', flag: '🇧🇪', country: 'Belgium' },
  { code: '+229', flag: '🇧🇯', country: 'Benin' },
  { code: '+591', flag: '🇧🇴', country: 'Bolivia' },
  { code: '+387', flag: '🇧🇦', country: 'Bosnia' },
  { code: '+267', flag: '🇧🇼', country: 'Botswana' },
  { code: '+55', flag: '🇧🇷', country: 'Brazil' },
  { code: '+359', flag: '🇧🇬', country: 'Bulgaria' },
  { code: '+226', flag: '🇧🇫', country: 'Burkina Faso' },
  { code: '+257', flag: '🇧🇮', country: 'Burundi' },
  { code: '+855', flag: '🇰🇭', country: 'Cambodia' },
  { code: '+237', flag: '🇨🇲', country: 'Cameroon' },
  { code: '+1', flag: '🇨🇦', country: 'Canada' },
  { code: '+238', flag: '🇨🇻', country: 'Cape Verde' },
  { code: '+236', flag: '🇨🇫', country: 'Central African Republic' },
  { code: '+235', flag: '🇹🇩', country: 'Chad' },
  { code: '+56', flag: '🇨🇱', country: 'Chile' },
  { code: '+86', flag: '🇨🇳', country: 'China' },
  { code: '+57', flag: '🇨🇴', country: 'Colombia' },
  { code: '+269', flag: '🇰🇲', country: 'Comoros' },
  { code: '+242', flag: '🇨🇬', country: 'Congo' },
  { code: '+243', flag: '🇨🇩', country: 'DR Congo' },
  { code: '+506', flag: '🇨🇷', country: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', country: 'Croatia' },
  { code: '+53', flag: '🇨🇺', country: 'Cuba' },
  { code: '+357', flag: '🇨🇾', country: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', country: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', country: 'Denmark' },
  { code: '+253', flag: '🇩🇯', country: 'Djibouti' },
  { code: '+1809', flag: '🇩🇴', country: 'Dominican Republic' },
  { code: '+593', flag: '🇪🇨', country: 'Ecuador' },
  { code: '+20', flag: '🇪🇬', country: 'Egypt' },
  { code: '+503', flag: '🇸🇻', country: 'El Salvador' },
  { code: '+240', flag: '🇬🇶', country: 'Equatorial Guinea' },
  { code: '+291', flag: '🇪🇷', country: 'Eritrea' },
  { code: '+372', flag: '🇪🇪', country: 'Estonia' },
  { code: '+251', flag: '🇪🇹', country: 'Ethiopia' },
  { code: '+358', flag: '🇫🇮', country: 'Finland' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+241', flag: '🇬🇦', country: 'Gabon' },
  { code: '+220', flag: '🇬🇲', country: 'Gambia' },
  { code: '+995', flag: '🇬🇪', country: 'Georgia' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+233', flag: '🇬🇭', country: 'Ghana' },
  { code: '+30', flag: '🇬🇷', country: 'Greece' },
  { code: '+502', flag: '🇬🇹', country: 'Guatemala' },
  { code: '+224', flag: '🇬🇳', country: 'Guinea' },
  { code: '+245', flag: '🇬🇼', country: 'Guinea-Bissau' },
  { code: '+509', flag: '🇭🇹', country: 'Haiti' },
  { code: '+504', flag: '🇭🇳', country: 'Honduras' },
  { code: '+36', flag: '🇭🇺', country: 'Hungary' },
  { code: '+354', flag: '🇮🇸', country: 'Iceland' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+62', flag: '🇮🇩', country: 'Indonesia' },
  { code: '+98', flag: '🇮🇷', country: 'Iran' },
  { code: '+964', flag: '🇮🇶', country: 'Iraq' },
  { code: '+353', flag: '🇮🇪', country: 'Ireland' },
  { code: '+972', flag: '🇮🇱', country: 'Israel' },
  { code: '+39', flag: '🇮🇹', country: 'Italy' },
  { code: '+225', flag: '🇨🇮', country: 'Ivory Coast' },
  { code: '+1876', flag: '🇯🇲', country: 'Jamaica' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+962', flag: '🇯🇴', country: 'Jordan' },
  { code: '+7', flag: '🇰🇿', country: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya' },
  { code: '+965', flag: '🇰🇼', country: 'Kuwait' },
  { code: '+996', flag: '🇰🇬', country: 'Kyrgyzstan' },
  { code: '+856', flag: '🇱🇦', country: 'Laos' },
  { code: '+371', flag: '🇱🇻', country: 'Latvia' },
  { code: '+961', flag: '🇱🇧', country: 'Lebanon' },
  { code: '+266', flag: '🇱🇸', country: 'Lesotho' },
  { code: '+231', flag: '🇱🇷', country: 'Liberia' },
  { code: '+218', flag: '🇱🇾', country: 'Libya' },
  { code: '+423', flag: '🇱🇮', country: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', country: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', country: 'Luxembourg' },
  { code: '+261', flag: '🇲🇬', country: 'Madagascar' },
  { code: '+265', flag: '🇲🇼', country: 'Malawi' },
  { code: '+60', flag: '🇲🇾', country: 'Malaysia' },
  { code: '+223', flag: '🇲🇱', country: 'Mali' },
  { code: '+356', flag: '🇲🇹', country: 'Malta' },
  { code: '+222', flag: '🇲🇷', country: 'Mauritania' },
  { code: '+230', flag: '🇲🇺', country: 'Mauritius' },
  { code: '+52', flag: '🇲🇽', country: 'Mexico' },
  { code: '+373', flag: '🇲🇩', country: 'Moldova' },
  { code: '+377', flag: '🇲🇨', country: 'Monaco' },
  { code: '+976', flag: '🇲🇳', country: 'Mongolia' },
  { code: '+382', flag: '🇲🇪', country: 'Montenegro' },
  { code: '+212', flag: '🇲🇦', country: 'Morocco' },
  { code: '+258', flag: '🇲🇿', country: 'Mozambique' },
  { code: '+95', flag: '🇲🇲', country: 'Myanmar' },
  { code: '+264', flag: '🇳🇦', country: 'Namibia' },
  { code: '+977', flag: '🇳🇵', country: 'Nepal' },
  { code: '+31', flag: '🇳🇱', country: 'Netherlands' },
  { code: '+64', flag: '🇳🇿', country: 'New Zealand' },
  { code: '+505', flag: '🇳🇮', country: 'Nicaragua' },
  { code: '+227', flag: '🇳🇪', country: 'Niger' },
  { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
  { code: '+850', flag: '🇰🇵', country: 'North Korea' },
  { code: '+389', flag: '🇲🇰', country: 'North Macedonia' },
  { code: '+47', flag: '🇳🇴', country: 'Norway' },
  { code: '+968', flag: '🇴🇲', country: 'Oman' },
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
  { code: '+970', flag: '🇵🇸', country: 'Palestine' },
  { code: '+507', flag: '🇵🇦', country: 'Panama' },
  { code: '+595', flag: '🇵🇾', country: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', country: 'Peru' },
  { code: '+63', flag: '🇵🇭', country: 'Philippines' },
  { code: '+48', flag: '🇵🇱', country: 'Poland' },
  { code: '+351', flag: '🇵🇹', country: 'Portugal' },
  { code: '+974', flag: '🇶🇦', country: 'Qatar' },
  { code: '+40', flag: '🇷🇴', country: 'Romania' },
  { code: '+7', flag: '🇷🇺', country: 'Russia' },
  { code: '+250', flag: '🇷🇼', country: 'Rwanda' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+221', flag: '🇸🇳', country: 'Senegal' },
  { code: '+381', flag: '🇷🇸', country: 'Serbia' },
  { code: '+248', flag: '🇸🇨', country: 'Seychelles' },
  { code: '+232', flag: '🇸🇱', country: 'Sierra Leone' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+421', flag: '🇸🇰', country: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', country: 'Slovenia' },
  { code: '+252', flag: '🇸🇴', country: 'Somalia' },
  { code: '+27', flag: '🇿🇦', country: 'South Africa' },
  { code: '+82', flag: '🇰🇷', country: 'South Korea' },
  { code: '+34', flag: '🇪🇸', country: 'Spain' },
  { code: '+94', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: '+249', flag: '🇸🇩', country: 'Sudan' },
  { code: '+46', flag: '🇸🇪', country: 'Sweden' },
  { code: '+41', flag: '🇨🇭', country: 'Switzerland' },
  { code: '+963', flag: '🇸🇾', country: 'Syria' },
  { code: '+886', flag: '🇹🇼', country: 'Taiwan' },
  { code: '+992', flag: '🇹🇯', country: 'Tajikistan' },
  { code: '+255', flag: '🇹🇿', country: 'Tanzania' },
  { code: '+66', flag: '🇹🇭', country: 'Thailand' },
  { code: '+228', flag: '🇹🇬', country: 'Togo' },
  { code: '+216', flag: '🇹🇳', country: 'Tunisia' },
  { code: '+90', flag: '🇹🇷', country: 'Turkey' },
  { code: '+993', flag: '🇹🇲', country: 'Turkmenistan' },
  { code: '+256', flag: '🇺🇬', country: 'Uganda' },
  { code: '+380', flag: '🇺🇦', country: 'Ukraine' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+598', flag: '🇺🇾', country: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', country: 'Uzbekistan' },
  { code: '+58', flag: '🇻🇪', country: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', country: 'Vietnam' },
  { code: '+967', flag: '🇾🇪', country: 'Yemen' },
  { code: '+260', flag: '🇿🇲', country: 'Zambia' },
  { code: '+263', flag: '🇿🇼', country: 'Zimbabwe' },
];

export default function PhoneInput({ value, onChange, className }) {
  const [countryCode, setCountryCode] = useState('+237'); // Par défaut : Cameroun
  const [phoneNumber, setPhoneNumber] = useState('');

  // Handle value from parent (initial load)
  React.useEffect(() => {
    if (value) {
      let matchedCode = '+237';
      let number = value;
      
      // Tri par longueur de code décroissante pour éviter +1 de matcher +1809
      const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
      
      for (const c of sortedCodes) {
        if (value.startsWith(c.code)) {
          matchedCode = c.code;
          number = value.substring(c.code.length).trim();
          break;
        }
      }
      
      setCountryCode(matchedCode);
      setPhoneNumber(number);
    }
  }, [value]);

  const triggerChange = (newCode, newNumber) => {
    if (onChange) {
      onChange(`${newCode} ${newNumber}`);
    }
  };

  const handleCodeChange = (newCode) => {
    setCountryCode(newCode);
    triggerChange(newCode, phoneNumber);
  };

  const handleNumberChange = (e) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    triggerChange(countryCode, newNumber);
  };

  const prefixSelector = (
    <>
      <style>{`
        /* Cacher la barre de défilement pour le dropdown Ant Design (Chrome, Safari, Edge) */
        .hide-scrollbar-dropdown .rc-virtual-list-holder::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        /* Firefox et IE/Edge */
        .hide-scrollbar-dropdown .rc-virtual-list-holder {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        /* Cacher l'élément custom scrollbar d'Ant Design */
        .hide-scrollbar-dropdown .rc-virtual-list-scrollbar {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        .hide-scrollbar-dropdown .ant-select-item-option-content {
          overflow: hidden;
        }
      `}</style>
      <Select
        value={countryCode}
        onChange={handleCodeChange}
        style={{ width: 100 }}
        dropdownMatchSelectWidth={false}
        className="bg-transparent"
        popupClassName="hide-scrollbar-dropdown"
        showSearch
        filterOption={(input, option) =>
          option.children.props.children[2].toLowerCase().includes(input.toLowerCase()) || 
          option.children.props.children[1].toLowerCase().includes(input.toLowerCase())
        }
      >
        {COUNTRY_CODES.map((country, idx) => (
          <Option key={`${country.code}-${idx}`} value={country.code}>
            <span className="flex items-center gap-2 text-sm" title={country.country}>
              <span>{country.flag}</span>
              <span className="text-slate-600">{country.code}</span>
              <span className="text-slate-400 text-xs truncate ml-1">{country.country}</span>
            </span>
          </Option>
        ))}
      </Select>
    </>
  );

  return (
    <Input
      addonBefore={prefixSelector}
      value={phoneNumber}
      onChange={handleNumberChange}
      className={className}
      type="tel"
    />
  );
}
