"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Info,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const indianStatesAndUTsList = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const categoryTooltips = {
  UR: "Unreserved - General category candidates.",
  OBC: "Other Backward Classes - Socially and educationally backward classes.",
  SC: "Scheduled Castes - Historically disadvantaged groups.",
  ST: "Scheduled Tribes - Indigenous tribal groups.",
  EWS: "Economically Weaker Sections - General category candidates with annual family income below ₹8 lakh.",
};

type ProfileData = {
  full_name: string;
  date_of_birth: string;
  age: number | null;
  gender: "M" | "F" | "Other" | "";
  category: "UR" | "OBC" | "SC" | "ST" | "EWS" | "";
  state: string;
  has_pwd: boolean;
  ex_serviceman: boolean;
  qualification: "10th" | "12th" | "Diploma" | "Graduate" | "Post Graduate" | "PhD" | "";
  degree: string;
  branch: string;
  grade_percentage: number | null;
  phone: string;
  skills: string;
  languages: string;
  exam_preference: string;
};

const initialProfileData: ProfileData = {
  full_name: "",
  date_of_birth: "",
  age: null,
  gender: "",
  category: "",
  state: "",
  has_pwd: false,
  ex_serviceman: false,
  qualification: "",
  degree: "",
  branch: "",
  grade_percentage: null,
  phone: "",
  skills: "",
  languages: "",
  exam_preference: "",
};

// A simple tooltip component
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full mb-2 w-48 p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {text}
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
      } else {
        setUserId(user.id);
        // Pre-fill name if available from auth
        setProfileData(prev => ({ ...prev, full_name: user.user_metadata?.full_name || '' }));
      }
    };
    getUser();
  }, [router]);

  const handleInputChange = (field: keyof ProfileData, value: string | number | boolean | null) => {
    setProfileData(prev => {
      const newData = { ...prev, [field]: value } as ProfileData;
      if (field === 'date_of_birth') {
        const birthDate = new Date(value as string);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        newData.age = age >= 0 ? age : null;
      }
      return newData;
    });
  };

  const validateStep1 = () => {
    return profileData.full_name && profileData.date_of_birth && profileData.gender && profileData.category && profileData.state;
  };

  const validateStep2 = () => {
    return profileData.qualification;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      setError("Please fill all required fields in Step 1.");
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      setError("Please fill all required fields in Step 2.");
      return;
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinishSetup = async () => {
    setIsSaving(true);
    setError(null);
    
    const payload = {
      user_id: userId,
      full_name: profileData.full_name || null,
      phone: profileData.phone || null,
      state: profileData.state || null,
      qualification: profileData.qualification || null,
      degree: profileData.degree || null,
      branch: profileData.branch || null,
      grade_percentage: profileData.grade_percentage,
      age: profileData.age,
      gender: profileData.gender || null,
      category: profileData.category || null,
      skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean),
      languages: profileData.languages.split(',').map(s => s.trim()).filter(Boolean),
      exam_preference: profileData.exam_preference || null,
    };

    try {
      if (!userId) throw new Error("User not found.");

      // Use user_id as the conflict target for upsert
      const { error: saveError } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });

      if (saveError) throw saveError;

      setSuccess("Profile saved! Finding eligible exams...");
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { number: 1, label: "Basic Info" },
    { number: 2, label: "Education" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1"><label htmlFor="full_name" className="text-sm font-medium">Full Name</label><input id="full_name" type="text" className="input" value={profileData.full_name} onChange={e => handleInputChange('full_name', e.target.value)} /></div>
              <div className="space-y-1"><label htmlFor="phone" className="text-sm font-medium">Mobile Number</label><input id="phone" type="tel" className="input" value={profileData.phone} onChange={e => handleInputChange('phone', e.target.value)} /></div>
              <div className="space-y-1"><label htmlFor="dob" className="text-sm font-medium">Date of Birth</label><input id="dob" type="date" className="input" value={profileData.date_of_birth} onChange={e => handleInputChange('date_of_birth', e.target.value)} />{profileData.age !== null && <p className="text-xs text-[var(--muted-foreground)] mt-1">Your age: {profileData.age}</p>}</div>
              <div className="space-y-1"><label className="text-sm font-medium">Gender</label><select className="input" value={profileData.gender} onChange={e => handleInputChange('gender', e.target.value)}><option value="" disabled>Select Gender</option><option value="M">Male</option><option value="F">Female</option><option value="Other">Other</option></select></div>
              <div className="space-y-1"><label className="text-sm font-medium flex items-center gap-2">Category<Tooltip text={categoryTooltips[profileData.category || 'UR']}><Info size={14} className="cursor-pointer text-[var(--muted-foreground)]" /></Tooltip></label><select className="input" value={profileData.category} onChange={e => handleInputChange('category', e.target.value)}><option value="" disabled>Select Category</option>{Object.keys(categoryTooltips).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div className="space-y-1 md:col-span-2"><label className="text-sm font-medium">State / Union Territory</label><select className="input" value={profileData.state} onChange={e => handleInputChange('state', e.target.value)}><option value="" disabled>Select State/UT</option>{indianStatesAndUTsList.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-[var(--border)]"><div className="flex items-center justify-between flex-1"><label htmlFor="has_pwd" className="font-medium">Do you have a PwD certificate?</label><label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" id="has_pwd" className="peer sr-only" checked={profileData.has_pwd} onChange={e => handleInputChange('has_pwd', e.target.checked)} /><div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div></label></div><div className="flex items-center justify-between flex-1"><label htmlFor="ex_serviceman" className="font-medium">Are you an Ex-Serviceman?</label><label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" id="ex_serviceman" className="peer sr-only" checked={profileData.ex_serviceman} onChange={e => handleInputChange('ex_serviceman', e.target.checked)} /><div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div></label></div></div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-1 md:col-span-2"><label className="text-sm font-medium">Qualification</label><select className="input" value={profileData.qualification} onChange={e => handleInputChange('qualification', e.target.value)}><option value="" disabled>Select Qualification</option><option value="10th">10th Pass</option><option value="12th">12th Pass</option><option value="Diploma">Diploma</option><option value="Graduate">Graduate</option><option value="Post Graduate">Post Graduate</option><option value="PhD">PhD</option></select></div>
              <div className="space-y-1"><label className="text-sm font-medium">Degree Name</label><input type="text" placeholder="e.g., B.Tech, B.Com" className="input" value={profileData.degree} onChange={e => handleInputChange('degree', e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Specialization / Branch</label><input type="text" placeholder="e.g., Computer Science" className="input" value={profileData.branch} onChange={e => handleInputChange('branch', e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Grade Percentage</label><input type="number" min="0" max="100" step="0.1" placeholder="e.g., 75.5" className="input" value={profileData.grade_percentage ?? ''} onChange={e => handleInputChange('grade_percentage', e.target.value ? parseFloat(e.target.value) : null)} /></div>
              <div className="space-y-1 md:col-span-2"><label className="text-sm font-medium">Skills (comma-separated)</label><textarea placeholder="e.g. Python, Data Analysis, Public Speaking" className="input" value={profileData.skills} onChange={e => handleInputChange('skills', e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Languages (comma-separated)</label><input type="text" placeholder="e.g. English, Hindi, Tamil" className="input" value={profileData.languages} onChange={e => handleInputChange('languages', e.target.value)} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Primary Exam Preference</label><select className="input" value={profileData.exam_preference} onChange={e => handleInputChange('exam_preference', e.target.value)}><option value="" disabled>Select Preference</option><option value="SSC">SSC Exams</option><option value="Banking">Banking Exams</option><option value="Railway">Railway Exams</option><option value="UPSC">UPSC Exams</option><option value="State PSC">State PSC Exams</option></select></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="page-main bg-slate-50 dark:bg-slate-900/50 min-h-screen flex items-center">
      <section className="page-container max-w-3xl mx-auto">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-center">Setup Your AvsarGrid Profile</h1>
          <p className="mt-2 text-center text-[var(--muted-foreground)]">
            A complete profile helps our AI find the perfect government exams for you.
          </p>

          {/* Stepper */}
          <div className="my-8 flex items-center">
            {steps.map((step, index) => (
              <>
                <div key={step.number} className="flex flex-1 flex-col items-center text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold transition-colors ${currentStep >= step.number ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                    {step.number}
                  </div>
                  <span className="mt-2 hidden text-xs font-medium sm:block">{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 transition-colors ${currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>}
              </>
            ))}
          </div>

          {error && <div className="alert-error mb-6">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">{success}</div>}
          
          <div className="min-h-[300px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button onClick={handleBack} className="btn-secondary gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
              )}
            </div>
            <div>
              {currentStep < 2 ? (
                <button onClick={handleNext} className="btn-primary gap-2">
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleFinishSetup} disabled={isSaving} className="btn-primary gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                  {isSaving ? "Saving Profile..." : "Finish Setup"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
