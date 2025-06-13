import React from "react";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SocketProvider } from "../components/SocketProvider";
import "../styles/globals.css";

// Custom theme
const theme = extendTheme({
  colors: {
    brand: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
  },
  fonts: {
    heading: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </ChakraProvider>
  );
}
