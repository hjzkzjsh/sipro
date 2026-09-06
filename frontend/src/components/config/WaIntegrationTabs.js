import React from "react";
import { BarChart3, Ban, FileCheck2, KeyRound } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WaIntegrationPanel from "@/components/config/WaIntegrationPanel";
import WaDeliveryPanel from "@/components/config/WaDeliveryPanel";
import WaOptOutPanel from "@/components/config/WaOptOutPanel";
import WaTemplateMetaPanel from "@/components/config/WaTemplateMetaPanel";
import { P97 } from "@/constants/testIds";

/** Pusat Konfigurasi › Integrasi WhatsApp (Fase 98): kredensial, dashboard pengiriman, opt-out, template Meta. */
export default function WaIntegrationTabs() {
  return (
    <Tabs defaultValue="creds" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger data-testid={P97.waTabCreds} value="creds"><KeyRound className="mr-1.5 h-4 w-4" /> Kredensial & Go-live</TabsTrigger>
        <TabsTrigger data-testid={P97.waTabDelivery} value="delivery"><BarChart3 className="mr-1.5 h-4 w-4" /> Dashboard Pengiriman</TabsTrigger>
        <TabsTrigger data-testid={P97.waTabOptout} value="optout"><Ban className="mr-1.5 h-4 w-4" /> Opt-out</TabsTrigger>
        <TabsTrigger data-testid={P97.waTabTemplates} value="templates"><FileCheck2 className="mr-1.5 h-4 w-4" /> Template Meta</TabsTrigger>
      </TabsList>
      <TabsContent value="creds"><WaIntegrationPanel /></TabsContent>
      <TabsContent value="delivery"><WaDeliveryPanel /></TabsContent>
      <TabsContent value="optout"><WaOptOutPanel /></TabsContent>
      <TabsContent value="templates"><WaTemplateMetaPanel /></TabsContent>
    </Tabs>
  );
}
