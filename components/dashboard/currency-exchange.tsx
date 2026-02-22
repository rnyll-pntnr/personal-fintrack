"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";
import { useProfile } from "@/hooks/use-user";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from '@/lib/currency'

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
  const [amount, setAmount] = useState<string>("1");

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

  const numericAmount = parseFloat(amount) || 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Exchange Rates</CardTitle>
        <p className="text-sm text-muted-foreground">
          {user?.currency} exchange rates
        </p>
        <CardAction className="hidden sm:block">
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
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Amount in {user?.currency}
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            className="focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Exchange Rates List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Converted Amounts
          </h3>
          <div className="space-y-2 grid grid-cols-2 gap-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))
            ) : (
              rates.map((rate) => (
                <div
                  key={rate.code}
                  className={`flex items-center justify-center p-3 rounded-lg hover:bg-accent/50 transition-colors ${user?.currency === rate.code ? 'hidden' : ''}`}
                >
                  <div className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-semibold">
                          {formatCurrency(( numericAmount * rate.rate), rate.code)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">
                          {formatCurrency(numericAmount, user?.currency || 'AED')} = {formatCurrency(numericAmount * rate.rate, rate.code)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <div className="text-xs text-muted-foreground">{rate.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-center text-muted-foreground sm:hidden">
        <p>
          Rates By <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Exchange Rate API</a>
        </p>
      </CardFooter>
    </Card>
  );
}
