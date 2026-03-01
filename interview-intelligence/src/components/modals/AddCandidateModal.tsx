"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Briefcase, FileText, ChevronDown, Check, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createCandidate } from "@/lib/actions/candidates";
import { cn } from "@/lib/utils";
import { jobTitles, jobLevels } from "@/lib/constants/job-titles";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedPosition {
  title: string;
  level: string;
}

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+961", country: "LB", flag: "🇱🇧", name: "Lebanon" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
  { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
  { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
].sort((a, b) => a.name.localeCompare(b.name));

export function AddCandidateModal({ isOpen, onClose, onSuccess }: AddCandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.country === "US") || countryCodes[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Positions state
  const [selectedPositions, setSelectedPositions] = useState<SelectedPosition[]>([]);
  const [currentLevel, setCurrentLevel] = useState("Mid-Level");
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const levelDropdownRef = useRef<HTMLDivElement>(null);

  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [positionSearchTerm, setPositionSearchTerm] = useState("");
  const positionDropdownRef = useRef<HTMLDivElement>(null);
  const positionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
        setIsPositionDropdownOpen(false);
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target as Node)) {
        setIsLevelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isDropdownOpen) {
      setSearchTerm("");
    }
  }, [isDropdownOpen]);

  const filteredCountries = countryCodes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.includes(searchTerm) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPositions = jobTitles.filter(title => 
    title.toLowerCase().includes(positionSearchTerm.toLowerCase())
  );

  const addPosition = (title: string) => {
    const alreadyExists = selectedPositions.some(p => p.title === title && p.level === currentLevel);
    if (!alreadyExists) {
      setSelectedPositions([...selectedPositions, { title, level: currentLevel }]);
    }
    setPositionSearchTerm("");
    setIsPositionDropdownOpen(false);
  };

  const removePosition = (index: number) => {
    setSelectedPositions(selectedPositions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (selectedPositions.length === 0 && !positionSearchTerm) {
      setError("Please add at least one position");
      return;
    }

    setLoading(true);

    const fullPhone = formData.phone ? `${selectedCountry.code} ${formData.phone}` : null;
    
    // Combine selected positions into a single string for the database
    const positionsList = selectedPositions.map(p => `${p.level} ${p.title}`);
    if (positionSearchTerm && !selectedPositions.some(p => p.title === positionSearchTerm)) {
      positionsList.push(`${currentLevel} ${positionSearchTerm}`);
    }
    const finalPositionString = positionsList.join(", ");

    try {
      await createCandidate({
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        position: finalPositionString,
        notes: formData.notes || null,
      });
      setFormData({ name: "", email: "", phone: "", notes: "" });
      setSelectedPositions([]);
      setPositionSearchTerm("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Add New Candidate</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="h-[52px] px-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[105px] justify-between"
                    >
                      <div className="w-5 h-3.5 flex-shrink-0 overflow-hidden rounded-sm shadow-sm border border-white/10">
                        <img 
                          src={`https://flagcdn.com/w40/${selectedCountry.country.toLowerCase()}.png`} 
                          alt={selectedCountry.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedCountry.code}</span>
                      <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform", isDropdownOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-2 w-72 max-h-80 flex flex-col bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden"
                        >
                          <div className="p-3 border-b border-white/10">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search country..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <button
                                  key={`${country.country}-${country.code}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                                >
                                  <div className="w-6 h-4 flex-shrink-0 overflow-hidden rounded-sm shadow-sm border border-white/10">
                                    <img 
                                      src={`https://flagcdn.com/w40/${country.country.toLowerCase()}.png`} 
                                      alt={country.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{country.name}</p>
                                    <p className="text-xs text-white/40">{country.code}</p>
                                  </div>
                                  {selectedCountry.country === country.country && (
                                    <Check className="w-4 h-4 text-blue-500" />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-white/30">
                                No countries found
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Positions Multi-Select */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/70">
                  Target Positions & Levels *
                </label>
                
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedPositions.map((pos, idx) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={`${pos.level}-${pos.title}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold"
                    >
                      <span>{pos.level}</span>
                      <span className="w-1 h-1 rounded-full bg-blue-400/50" />
                      <span>{pos.title}</span>
                      <button
                        type="button"
                        onClick={() => removePosition(idx)}
                        className="p-0.5 hover:bg-blue-500/20 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {/* Level Selector */}
                  <div className="relative" ref={levelDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                      className="h-[52px] px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                      {currentLevel}
                      <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform", isLevelDropdownOpen && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {isLevelDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-2 w-48 max-h-60 overflow-y-auto bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[60] custom-scrollbar"
                        >
                          {jobLevels.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                setCurrentLevel(level);
                                setIsLevelDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white flex items-center justify-between"
                            >
                              {level}
                              {currentLevel === level && <Check className="w-4 h-4 text-blue-500" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Position Search */}
                  <div className="relative flex-1" ref={positionDropdownRef}>
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      ref={positionInputRef}
                      type="text"
                      value={positionSearchTerm}
                      onChange={(e) => {
                        setPositionSearchTerm(e.target.value);
                        setIsPositionDropdownOpen(true);
                      }}
                      onFocus={() => setIsPositionDropdownOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && positionSearchTerm) {
                          e.preventDefault();
                          addPosition(positionSearchTerm);
                        }
                      }}
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                      placeholder="Search or type position..."
                    />
                    {positionSearchTerm && (
                      <button
                        type="button"
                        onClick={() => addPosition(positionSearchTerm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        title="Add position"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    <AnimatePresence>
                      {isPositionDropdownOpen && positionSearchTerm.length > 0 && filteredPositions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[60] custom-scrollbar"
                        >
                          {filteredPositions.map((title) => (
                            <button
                              key={title}
                              type="button"
                              onClick={() => addPosition(title)}
                              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors text-sm text-white/80 hover:text-white"
                            >
                              <span dangerouslySetInnerHTML={{
                                __html: title.replace(
                                  new RegExp(`(${positionSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                  '<span class="text-blue-400 font-bold">$1</span>'
                                )
                              }} />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-gray-900 pb-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={loading}
                >
                  Add Candidate
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
