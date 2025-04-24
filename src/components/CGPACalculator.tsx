import React, { useState } from 'react';
import { Plus, Calculator, Trash2, ChartBarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface SemesterData {
  id: number;
  sgpa: string;
  credits: string;
}

interface CGPAInsights {
  nextSemTarget: number | null;
  overall8Target: number | null;
  progressToNext: number;
}

const CGPACalculator = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([
    { id: 1, sgpa: '', credits: '' }
  ]);
  const [cgpa, setCGPA] = useState<number | null>(null);
  const [insights, setInsights] = useState<CGPAInsights>({
    nextSemTarget: null,
    overall8Target: null,
    progressToNext: 0
  });
  const { toast } = useToast();

  const addSemester = () => {
    setSemesters([...semesters, { id: semesters.length + 1, sgpa: '', credits: '' }]);
  };

  const removeSemester = (id: number) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(sem => sem.id !== id));
    }
  };

  const handleInputChange = (id: number, field: 'sgpa' | 'credits', value: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === id) {
        return { ...sem, [field]: value };
      }
      return sem;
    }));
  };

  const calculateInsights = (currentCGPA: number, totalCredits: number) => {
    const nextHalf = Math.ceil(currentCGPA * 2) / 2;
    const nextSemCredits = 20;
    const nextSemTarget = ((nextHalf * (totalCredits + nextSemCredits)) - (currentCGPA * totalCredits)) / nextSemCredits;
    const remainingSemesters = 8 - semesters.length;
    const remainingCredits = remainingSemesters * nextSemCredits;
    const overall8Target = remainingSemesters > 0 
      ? ((8 * (totalCredits + remainingCredits)) - (currentCGPA * totalCredits)) / remainingCredits
      : null;
    const progressToNext = ((currentCGPA - Math.floor(currentCGPA * 2) / 2) / 0.5) * 100;

    setInsights({
      nextSemTarget: nextSemTarget > 0 && nextSemTarget <= 10 ? nextSemTarget : null,
      overall8Target: overall8Target !== null && overall8Target > 0 && overall8Target <= 10 ? overall8Target : null,
      progressToNext
    });
  };

  const calculateCGPA = () => {
    let totalWeightedSGPA = 0;
    let totalCredits = 0;
    let isValid = true;

    for (const sem of semesters) {
      const sgpa = parseFloat(sem.sgpa);
      const credits = parseFloat(sem.credits);

      if (isNaN(sgpa) || isNaN(credits) || sgpa < 0 || sgpa > 10 || credits <= 0) {
        isValid = false;
        toast({
          title: "Invalid Input",
          description: "Please ensure SGPA is between 0-10 and credits are positive numbers.",
          variant: "destructive",
        });
        break;
      }

      totalWeightedSGPA += sgpa * credits;
      totalCredits += credits;
    }

    if (isValid) {
      const calculatedCGPA = totalWeightedSGPA / totalCredits;
      setCGPA(calculatedCGPA);
      calculateInsights(calculatedCGPA, totalCredits);
      toast({
        title: "CGPA Calculated",
        description: `Your aggregate CGPA is ${calculatedCGPA.toFixed(2)}`,
      });
    }
  };

  const clearData = () => {
    setSemesters([{ id: 1, sgpa: '', credits: '' }]);
    setCGPA(null);
    setInsights({
      nextSemTarget: null,
      overall8Target: null,
      progressToNext: 0
    });
    toast({
      title: "Data Cleared",
      description: "All semester data has been reset.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            DTU CGPA Calculator
          </h1>
          <p className="text-gray-600 text-lg">
            Calculate your academic journey with precision
          </p>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100">
          <div className="space-y-6">
            {semesters.map((semester) => (
              <div
                key={semester.id}
                className="flex gap-4 items-center animate-fade-in"
              >
                <div className="w-28 shrink-0">
                  <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Semester {semester.id}
                  </p>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="SGPA"
                  value={semester.sgpa}
                  onChange={(e) => handleInputChange(semester.id, 'sgpa', e.target.value)}
                  className="w-32 transition-all hover:border-purple-400 focus:border-purple-500"
                />
                <Input
                  type="number"
                  placeholder="Credits"
                  value={semester.credits}
                  onChange={(e) => handleInputChange(semester.id, 'credits', e.target.value)}
                  className="w-32 transition-all hover:border-purple-400 focus:border-purple-500"
                />
                {semesters.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeSemester(semester.id)}
                    className="hover:scale-105 transition-transform"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button 
              onClick={addSemester} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Semester
            </Button>
            <Button 
              onClick={calculateCGPA} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all hover:scale-105"
            >
              <Calculator className="h-4 w-4 mr-2" /> Calculate CGPA
            </Button>
            <Button 
              onClick={clearData} 
              variant="outline" 
              className="hover:border-purple-400 transition-all hover:scale-105"
            >
              Clear All
            </Button>
          </div>

          {cgpa !== null && (
            <div className="mt-8 space-y-6 animate-fade-in">
              <div className="p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Your Academic Insights
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-purple-600 mb-2">
                      Current CGPA: {cgpa.toFixed(2)}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Progress to next grade point</p>
                      <Progress value={insights.progressToNext} className="h-2" />
                    </div>
                  </div>

                  {insights.nextSemTarget && (
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">To reach next 0.5 CGPA</p>
                      <p className="text-lg font-semibold text-purple-600">
                        Need {insights.nextSemTarget.toFixed(2)} SGPA in next semester
                      </p>
                    </div>
                  )}

                  {insights.overall8Target && (
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">To achieve 8+ CGPA</p>
                      <p className="text-lg font-semibold text-purple-600">
                        Need {insights.overall8Target.toFixed(2)} SGPA in remaining semesters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CGPACalculator;
