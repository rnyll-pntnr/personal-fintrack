"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";
import { useProfile } from "@/hooks/use-user";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  symbol: string;
}

const POPULAR_CURRENCIES = [
  { code: "PHP", name: "Philippine Peso" },
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "INR", name: "Indian Rupee" },
  { code: "USD", name: "US Dollar" },
  { code: "AUD", name: "Australian Dollar" }
];

export function CurrencyExchange() {
  const { data: user } = useProfile();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.currency) return;

    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Replace with your API endpoint
        const response = await fetch(
          `https://open.er-api.com/v6/latest/${user.currency}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch exchange rates");
        
        const data = await response.json();
        
        const formattedRates = POPULAR_CURRENCIES.map((currency) => ({
          ...currency,
          symbol: getCurrencySymbol(currency.code),
          rate: data.rates[currency.code],
        }));
        
        setRates(formattedRates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [user?.currency]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exchange Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to fetch exchange rates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exchange Rates</CardTitle>
        <p className="text-sm text-muted-foreground">
          {user?.currency} exchange rates
        </p>
        <CardAction>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                Rates By <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Exchange Rate API</a>
              </p>
            </TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-16 w-32" />
              </div>
            ))
          ) : (
            rates.map((rate) => (
              <div
                key={rate.code}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors ${user?.currency === rate.code ? 'hidden' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rate.symbol}</span>
                  <span className="text-sm text-muted-foreground">{rate.code} 1.00</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {rate.rate.toFixed(2)} {user?.currency}
                  </div>
                  <div className="text-xs text-muted-foreground">{rate.name}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
