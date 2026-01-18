
"use client";

import { useState, useMemo } from "react";
import { Calculator, Scale, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Textarea } from "@/components/ui/textarea";

interface CalculationResult {
  length: number;
  weight: number;
}

export default function WeightCalculatorPage() {
  const { toast } = useToast();
  const { items } = useData();
  
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [lengthsInput, setLengthsInput] = useState<string>("");
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [totalWeight, setTotalWeight] = useState<number>(0);

  const aluminiumItems = useMemo(() => 
    items.filter(item => item.category === 'Aluminium' && item.weight && item.weight > 0)
    .sort((a, b) => a.name.localeCompare(b.name)), 
  [items]);

  const selectedItem = useMemo(() => 
    aluminiumItems.find(item => item.id === selectedItemId),
  [aluminiumItems, selectedItemId]);

  const handleCalculate = () => {
    if (!selectedItem || !selectedItem.weight) {
      toast({ variant: "destructive", title: "Please select a section with a valid weight." });
      return;
    }

    const lengths = lengthsInput
      .split(/[\s,;\n]+/) // Split by spaces, commas, semicolons, or newlines
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    if (lengths.length === 0) {
      toast({ variant: "destructive", title: "Please enter valid lengths." });
      return;
    }

    const newResults: CalculationResult[] = lengths.map(length => ({
      length,
      weight: length * selectedItem.weight!,
    }));

    const newTotalWeight = newResults.reduce((sum, result) => sum + result.weight, 0);

    setResults(newResults);
    setTotalWeight(newTotalWeight);
  };

  const clearReport = () => {
    setResults([]);
    setTotalWeight(0);
    setLengthsInput("");
  }

  return (
    <>
      <PageHeader
        title="Section Weight Calculator"
        description="Calculate the total weight of aluminium sections based on their lengths."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Calculator</CardTitle>
                <CardDescription>Select a section and enter lengths to calculate weight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="section">Aluminium Section</Label>
                    <Select onValueChange={setSelectedItemId} value={selectedItemId}>
                        <SelectTrigger id="section">
                            <SelectValue placeholder="Select a section..." />
                        </SelectTrigger>
                        <SelectContent>
                            {aluminiumItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.name} ({item.thickness}) - {item.color}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedItem && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                        <p className="font-semibold">Weight per Foot: <span className="font-bold text-primary">{selectedItem.weight?.toFixed(3)} kg/ft</span></p>
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label htmlFor="lengths">Lengths (in feet)</Label>
                    <Textarea 
                        id="lengths"
                        placeholder="Enter lengths separated by space, comma, or new line. e.g. 18 16 14.5"
                        value={lengthsInput}
                        onChange={(e) => setLengthsInput(e.target.value)}
                        rows={5}
                    />
                </div>

                <Button onClick={handleCalculate} className="w-full" disabled={!selectedItemId}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Weight
                </Button>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Weight Report</CardTitle>
                        <CardDescription>Summary of the calculated weights.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()} className="no-print" disabled={results.length === 0}>
                            Print Report
                        </Button>
                        <Button variant="ghost" size="icon" onClick={clearReport} className="no-print" disabled={results.length === 0}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="hidden print:block text-center mb-6">
                    <h1 className="text-2xl font-bold font-headline">ARCO Aluminium Company</h1>
                    <p className="text-lg font-semibold mt-1">Section Weight Report</p>
                    {selectedItem && <p className="text-sm text-muted-foreground">{selectedItem.name} ({selectedItem.thickness}) - {selectedItem.weight?.toFixed(3)} kg/ft</p>}
                </div>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Length (ft)</TableHead>
                                <TableHead className="text-right">Weight (kg)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No calculation performed yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{result.length.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-mono">{result.weight.toFixed(3)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {results.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-right font-bold text-lg">Total Weight</TableCell>
                                    <TableCell className="text-right font-bold text-lg font-mono">{totalWeight.toFixed(3)} kg</TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
