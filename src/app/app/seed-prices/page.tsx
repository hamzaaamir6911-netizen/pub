
"use client";

import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import priceData from "@/lib/price-list.json";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SeedPricesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    toast({ title: "Seeding started...", description: "This might take a moment." });

    try {
      const batch = writeBatch(firestore);
      const priceListCollection = collection(firestore, "price_list");
      
      const allCategories = Object.keys(priceData) as Array<keyof typeof priceData>;

      allCategories.forEach(categoryKey => {
        const items = priceData[categoryKey];
        const categoryName = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        items.forEach(item => {
          const docRef = collection(firestore, 'price_list').doc();
          batch.set(docRef, { ...item, category: categoryName });
        });
      });

      await batch.commit();

      toast({ title: "Success!", description: "Price list has been seeded to the database." });
    } catch (error: any) {
      console.error("Error seeding price list:", error);
      toast({
        variant: "destructive",
        title: "Error seeding data",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Seed Price List"
        description="One-time action to populate the price list from the JSON file."
      />
      <Card>
        <CardHeader>
            <CardTitle>Database Seeding</CardTitle>
            <CardDescription>
                Click the button below to import the entire price list from the image into your database. This is a one-time operation. Do not perform this action if the data has already been seeded.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleSeed} disabled={isLoading}>
                {isLoading ? "Seeding Data..." : "Seed Price List to Database"}
            </Button>
        </CardContent>
      </Card>
    </>
  );
}

    