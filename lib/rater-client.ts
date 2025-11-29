// RaterClient - API client for the backend rater service
// Provides real-time exchange rates and provider ratings via Minswap Aggregator

import type {
    RateRequest,
    RateResponse,
    ProviderRating,
    RouteRating,
    TransactionRating
} from '@/types/rater';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export class RaterClient {
    /**
     * Get comprehensive rate information including route ratings,
     * provider recommendations, and transaction estimates
     */
    async getRateEstimate(
        amount: number,
        fromCurrency: string,
        toCurrency: string,
        fromCountry?: string,
        toCountry?: string,
        preferredSpeed: string = "normal"
    ): Promise<RateResponse> {
        try {
            const payload: RateRequest = {
                from_currency: fromCurrency,
                to_currency: toCurrency,
                amount,
                from_country: fromCountry,
                to_country: toCountry,
                preferred_speed: preferredSpeed
            };

            const res = await fetch(`${BACKEND_URL}/api/rater/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Rater API Error: ${res.status} ${res.statusText}`, errorText);
                throw new Error(`Failed to get rate: ${res.status} ${res.statusText}`);
            }

            const data: RateResponse = await res.json();
            return data;

        } catch (error) {
            console.error("[RaterClient] Error getting rate estimate:", error);
            throw error;
        }
    }

    /**
     * Get ratings for all available remittance providers
     */
    async getAllProviders(): Promise<ProviderRating[]> {
        try {
            const res = await fetch(`${BACKEND_URL}/api/rater/providers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to get providers: ${res.status}`);
            }

            return await res.json();

        } catch (error) {
            console.error("[RaterClient] Error getting providers:", error);
            throw error;
        }
    }

    /**
     * Get detailed rating for a specific provider
     */
    async getProviderRating(providerName: string): Promise<ProviderRating> {
        try {
            const res = await fetch(`${BACKEND_URL}/api/rater/providers/${providerName}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to get provider rating: ${res.status}`);
            }

            return await res.json();

        } catch (error) {
            console.error("[RaterClient] Error getting provider rating:", error);
            throw error;
        }
    }

    /**
     * Get rating for a specific remittance route
     */
    async getRouteRating(
        fromCurrency: string,
        toCurrency: string,
        fromCountry: string = "USA",
        toCountry: string = "India"
    ): Promise<RouteRating> {
        try {
            const res = await fetch(
                `${BACKEND_URL}/api/rater/route/${fromCurrency}/${toCurrency}?from_country=${fromCountry}&to_country=${toCountry}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`Failed to get route rating: ${res.status}`);
            }

            return await res.json();

        } catch (error) {
            console.error("[RaterClient] Error getting route rating:", error);
            throw error;
        }
    }

    /**
     * Rate a specific transaction with given parameters
     */
    async rateTransaction(
        amount: number,
        fromCurrency: string,
        toCurrency: string,
        provider: string = "MinswapDEX"
    ): Promise<TransactionRating> {
        try {
            const res = await fetch(
                `${BACKEND_URL}/api/rater/transaction?amount=${amount}&from_currency=${fromCurrency}&to_currency=${toCurrency}&provider=${provider}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`Failed to rate transaction: ${res.status}`);
            }

            return await res.json();

        } catch (error) {
            console.error("[RaterClient] Error rating transaction:", error);
            throw error;
        }
    }
}

export const raterClient = new RaterClient();
