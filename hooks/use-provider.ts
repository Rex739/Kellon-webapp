import { useEffect, useState } from "react";
import { providerService } from "@/services/api/payment-providers";

interface Provider {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  fee: string;
  isRecommended?: boolean;
  features: string[];
}

export function useProviders(
  country: string | null,
  asset: string | null,
  networkName: string | null,
  currency: string | null,
  type: "buy" | "sell" = "buy",
) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!country || !asset || !networkName || !currency) {
        setProviders([]);
        setSelectedProviderId("");
        return;
      }
      setIsLoading(true);
      try {
        const response = await providerService.listProviders({
          country,
          currency,
          network: networkName,
          type,
        });
        if (response.success && response.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            logo: p.logo,
            deliveryTime: p.processingTime,
            fee: `${p.fees.percentage}%`,
            features: p.features || [],
            isRecommended: p.metadata?.isRecommended || false,
          }));
          setProviders(mapped);
          setSelectedProviderId((currentProviderId) => {
            if (!mapped.length) {
              return "";
            }

            if (mapped.some((provider) => provider.id === currentProviderId)) {
              return currentProviderId;
            }

            return "";
          });
        } else {
          setProviders([]);
          setSelectedProviderId("");
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        setProviders([]);
        setSelectedProviderId("");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, [country, asset, networkName, currency, type]);

  return {
    providers,
    selectedProviderId,
    setSelectedProviderId,
    isLoadingProviders: isLoading,
  };
}
