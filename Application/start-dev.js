import os from "os";
import { spawn } from "child_process";

const PORT = 5173;

function getLocalIPv4() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const network of interfaces[name]) {
      if (
        network.family === "IPv4" &&
        !network.internal &&
        !network.address.startsWith("169.254")
      ) {
        return network.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIPv4();
const protocol = "https";

console.log("\nStarting LuxeMart...\n");
console.log(`Local:   ${protocol}://localhost:${PORT}`);
console.log(`Network: ${protocol}://${ip}:${PORT}`);
console.log("\nOpen the Network link on this device or another device on the same Wi-Fi.\n");

const vite = spawn(
  "npx",
  ["vite", "--host", "0.0.0.0", "--port", String(PORT)],
  {
    stdio: "inherit",
    shell: true
  }
);

vite.on("close", (code) => {
  process.exit(code);
});