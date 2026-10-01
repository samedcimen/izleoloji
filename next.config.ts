import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Dev sunucusuna yerel ağdan (ör. telefondan http://192.168.1.4:3025) erişim
    allowedDevOrigins: ["192.168.1.4"],
};

export default nextConfig;
