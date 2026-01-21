import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GradientButton } from "@/components/ui/GradientButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { FileUp, FileText, CheckCircle, AlertTriangle, Loader2, Sparkles } from "lucide-react";

interface AnalysisResult {
  status: "normal" | "attention" | "urgent";
  summary: string;
  details: string[];
  recommendations: string[];
}

export const ReportAnalyzer = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const analyzeReport = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis - Replace with actual Gemini integration
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setResult({
      status: "normal",
      summary: "Your blood work results are within normal ranges. Overall health indicators look good.",
      details: [
        "Hemoglobin: 14.2 g/dL (Normal)",
        "White Blood Cells: 7,500 /μL (Normal)",
        "Platelets: 250,000 /μL (Normal)",
        "Fasting Glucose: 95 mg/dL (Normal)",
      ],
      recommendations: [
        "Continue maintaining a balanced diet",
        "Stay hydrated with 8+ glasses of water daily",
        "Regular exercise 30 minutes daily",
        "Schedule your next checkup in 6 months",
      ],
    });

    setIsAnalyzing(false);
  };

  const statusColors = {
    normal: "text-green-600 bg-green-50",
    attention: "text-yellow-600 bg-yellow-50",
    urgent: "text-red-600 bg-red-50",
  };

  const statusIcons = {
    normal: CheckCircle,
    attention: AlertTriangle,
    urgent: AlertTriangle,
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : file
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">{file.name}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-sm text-destructive hover:underline"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <motion.div
              animate={{ y: isDragging ? -5 : 0 }}
              className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <FileUp className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <p className="font-medium text-foreground mb-2">
              Drop your medical report here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse (PDF, Images supported)
            </p>
            <label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <GradientButton
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </GradientButton>
            </label>
          </>
        )}
      </motion.div>

      {/* Analyze Button */}
      {file && !result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <GradientButton
            variant="primary"
            size="lg"
            onClick={analyzeReport}
            disabled={isAnalyzing}
            className="min-w-[200px]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze with AI
              </>
            )}
          </GradientButton>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          {/* Status Badge */}
          <AnimatedCard delay={0.1} hover={false}>
            <div className="flex items-center gap-3">
              {(() => {
                const StatusIcon = statusIcons[result.status];
                return (
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[result.status]}`}
                  >
                    <StatusIcon className="w-6 h-6" />
                  </div>
                );
              })()}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[result.status]}`}
                >
                  {result.status}
                </span>
                <p className="text-foreground mt-1">{result.summary}</p>
              </div>
            </div>
          </AnimatedCard>

          {/* Details */}
          <AnimatedCard delay={0.2} hover={false}>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Key Findings
            </h4>
            <ul className="space-y-2">
              {result.details.map((detail, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </AnimatedCard>

          {/* Recommendations */}
          <AnimatedCard delay={0.3} hover={false}>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </AnimatedCard>

          <div className="text-center pt-4">
            <GradientButton
              variant="outline"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            >
              Analyze Another Report
            </GradientButton>
          </div>
        </motion.div>
      )}
    </div>
  );
};
