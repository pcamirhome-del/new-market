
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera permissions to use the barcode scanner.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleMockScan = () => {
    const mockBarcodes = ['6221234567890', '12345678', '98765432'];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    onScan(randomBarcode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white">
          <h2 className="font-semibold">Barcode Scanner</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="aspect-square bg-black relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          {/* Overlay grid */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-32 border-2 border-green-500/50 rounded-lg shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Point the camera at a product barcode</p>
          <button 
            onClick={handleMockScan}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            Mock Scan (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
