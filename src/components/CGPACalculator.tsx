
import React, { useState } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface SemesterData {
  id: number;
  sgpa: string;
  credits: string;
}

const CGPACalculator = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([
    { id: 1, sgpa: '', credits: '' }
  ]);
  const [cgpa, setCGPA] = useState<number | null>(null);
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
      toast({
        title: "CGPA Calculated",
        description: `Your aggregate CGPA is ${calculatedCGPA.toFixed(2)}`,
      });
    }
  };

  const clearData = () => {
    setSemesters([{ id: 1, sgpa: '', credits: '' }]);
    setCGPA(null);
    toast({
      title: "Data Cleared",
      description: "All semester data has been reset.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DTU CGPA Calculator</h1>
          <p className="text-gray-600">Calculate your aggregate CGPA based on semester-wise performance</p>
        </div>

        <Card className="p-6 bg-white shadow-lg rounded-lg">
          <div className="space-y-4">
            {semesters.map((semester) => (
              <div key={semester.id} className="flex gap-4 items-center">
                <div className="w-24 shrink-0">
                  <p className="text-sm font-medium text-gray-700">Semester {semester.id}</p>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="SGPA"
                  value={semester.sgpa}
                  onChange={(e) => handleInputChange(semester.id, 'sgpa', e.target.value)}
                  className="w-32"
                />
                <Input
                  type="number"
                  placeholder="Credits"
                  value={semester.credits}
                  onChange={(e) => handleInputChange(semester.id, 'credits', e.target.value)}
                  className="w-32"
                />
                {semesters.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSemester(semester.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Button onClick={addSemester} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Semester
            </Button>
            <Button onClick={calculateCGPA} className="flex items-center gap-2" variant="default">
              <Calculator className="h-4 w-4" /> Calculate CGPA
            </Button>
            <Button onClick={clearData} variant="outline">
              Clear All
            </Button>
          </div>

          {cgpa !== null && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-center text-lg font-semibold text-blue-900">
                Your Aggregate CGPA: {cgpa.toFixed(2)}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CGPACalculator;
