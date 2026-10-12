import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Check, X, Shield, RefreshCw, KeyRound, ArrowRight, Trash2 } from 'lucide-react';
import { usePhoneAuth, COUNTRY_CODES } from '../context/PhoneAuthContext';
import { useSocket } from '../context/SocketContext';

export default function PhoneVerificationModal({ isOpen, onClose }) {
  const { phoneStatus, sendOtp, verifyOtp, unlinkPhone } = usePhoneAuth();
  const { deviceName } = useSocket();

  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [step, setStep] = useState(phoneStatus.isVerified ? 'VERIFIED' : 'INPUT_PHONE'); // INPUT_PHONE, ENTER_OTP, VERIFIED
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [hintDevOtp, setHintDevOtp] = useState('');

  useEffect(() => {
    if (phoneStatus.isVerified) {
      setStep('VERIFIED');
    } else {
      setStep('INPUT_PHONE');
    }
  }, [phoneStatus.isVerified]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phoneInput.trim()) {
      setErrorMsg('Please enter your mobile number');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await sendOtp(phoneInput.trim(), selectedCountry);
    setIsLoading(false);

    if (res.success) {
      setStep('ENTER_OTP');
      setSuccessMsg(res.message);
      setCooldown(res.cooldownSeconds || 30);
      if (res.devOtp) {
        setHintDevOtp(res.devOtp);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otpInput.trim().length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const res = await verifyOtp(phoneInput.trim(), otpInput.trim(), deviceName);
    setIsLoading(false);

    if (res.success) {
      setStep('VERIFIED');
      setSuccessMsg('Phone verified successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleUnlink = async () => {
    if (window.confirm('Are you sure you want to unlink your mobile number? Others will no longer be able to find you by this phone number.')) {
      setIsLoading(true);
      await unlinkPhone();
      setIsLoading(false);
      setPhoneInput('');
      setOtpInput('');
      setStep('INPUT_PHONE');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl bg-[#111b21] border border-[#00a884]/30 shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#202c33] border-b border-[rgba(134,150,160,0.15)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#25d366] flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#e9edef]">Mobile Number Verification</h3>
                <p className="text-[11px] text-[#8696a0]">WhatsApp-style phone registration & discovery</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-[#25d366]/10 border border-[#25d366]/20 text-xs text-[#25d366]">
                {successMsg}
              </div>
            )}

            {/* STEP: ALREADY VERIFIED */}
            {step === 'VERIFIED' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#25d366]/20 text-[#25d366] flex items-center justify-center shadow-lg shadow-[#25d366]/10">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#e9edef]">Phone Number Verified</h4>
                  <p className="text-sm font-semibold text-[#25d366] mt-1 tracking-wider">
                    {phoneStatus.phoneNumberE164}
                  </p>
                  <p className="text-xs text-[#8696a0] mt-2 max-w-xs mx-auto">
                    Users can now search and start real-time chats with you using your verified mobile number.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('INPUT_PHONE');
                      setPhoneInput('');
                      setOtpInput('');
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942] transition-colors"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleUnlink}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Unlink
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: INPUT PHONE NUMBER */}
            {step === 'INPUT_PHONE' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-[#8696a0]">
                  Enter your phone number. We will send a secure 6-digit OTP verification code.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8696a0]">Country & Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="px-2.5 py-2.5 rounded-xl bg-[#202c33] text-[#e9edef] border border-[rgba(134,150,160,0.2)] text-xs focus:border-[#00a884] focus:outline-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dialCode} ({c.name})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] border border-[rgba(134,150,160,0.2)] text-sm focus:border-[#00a884] focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#202c33]/40 border border-[rgba(134,150,160,0.1)] text-[11px] text-[#8696a0]">
                  <Shield className="w-4 h-4 text-[#00a884] shrink-0" />
                  <span>Your number is verified cryptographically and respects your privacy settings.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phoneInput.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#00a884] text-white hover:bg-[#008069] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#00a884]/20"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: ENTER OTP */}
            {step === 'ENTER_OTP' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#e9edef]">Enter 6-Digit Code</h4>
                  <p className="text-xs text-[#8696a0] mt-1">
                    Sent to <span className="text-[#e9edef] font-semibold">{phoneInput}</span>
                  </p>
                </div>

                {hintDevOtp && (
                  <div
                    onClick={() => setOtpInput(hintDevOtp)}
                    className="p-2.5 rounded-xl bg-[#25d366]/10 border border-[#25d366]/30 text-xs text-[#25d366] cursor-pointer hover:bg-[#25d366]/20 transition-colors flex items-center justify-between"
                    title="Click to auto-fill development OTP"
                  >
                    <span>🛠️ Dev Code: <strong className="font-mono text-sm tracking-widest">{hintDevOtp}</strong></span>
                    <span className="text-[11px] underline">Auto-fill</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl bg-[#202c33] text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#8696a0]">
                  <button
                    type="button"
                    onClick={() => setStep('INPUT_PHONE')}
                    className="hover:text-white transition-colors"
                  >
                    Wrong number?
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={cooldown > 0}
                    className="text-[#00a884] hover:underline disabled:opacity-50"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpInput.length !== 6}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#00a884] text-white hover:bg-[#008069] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#00a884]/20"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
