import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface SignaturePadProps {
  value: string;
  onChange: (signature: string) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const webViewRef = useRef<WebView>(null);
  const [height, setHeight] = useState(200);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f9fafb;
          touch-action: none;
        }
        .signature-pad {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100vh;
        }
        canvas {
          width: 100%;
          height: 100%;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="signature-pad">
        <canvas></canvas>
      </div>
      <script>
        const canvas = document.querySelector("canvas");
        const signaturePad = new SignaturePad(canvas, {
          backgroundColor: 'rgb(255, 255, 255)',
          penColor: 'rgb(26, 0, 102)'
        });

        ${value ? `signaturePad.fromDataURL("${value}");` : ''}

        signaturePad.addEventListener("endStroke", () => {
          window.ReactNativeWebView.postMessage(signaturePad.toDataURL());
        });

        window.clearSignature = () => {
          signaturePad.clear();
          window.ReactNativeWebView.postMessage('');
        };
      </script>
    </body>
    </html>
  `;

  const handleClear = () => {
    webViewRef.current?.injectJavaScript('window.clearSignature();');
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={[styles.webview, { height }]}
        onMessage={(event) => onChange(event.nativeEvent.data)}
        scrollEnabled={false}
        bounces={false}
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      />
      <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.clearButtonText}>Clear Signature</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
  clearButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ef4444',
  },
});