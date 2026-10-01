import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Dev sunucusuna yerel ağdan (ör. telefondan http://192.168.1.4:3025) erişim
    allowedDevOrigins: ["192.168.1.4"],
    // Geliştirme araç düğmesi sol altta yan menüdeki profil resminin üstüne biniyordu
    devIndicators: { position: "bottom-right" },
};

export default nextConfig;
