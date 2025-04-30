import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Platform, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';

interface SignatureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  initialValue?: string;
}

export default function SignatureModal({ isVisible, onClose, onSave, initialValue }: SignatureModalProps) {
  const webViewRef = useRef<WebView>(null);
  const windowHeight = Dimensions.get('window').height;

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
          background: #fff;
          touch-action: none;
          overflow: hidden;
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

        ${initialValue ? `signaturePad.fromDataURL("${initialValue}");` : ''}

        window.clearSignature = () => {
          signaturePad.clear();
        };

        window.getSignature = () => {
          return signaturePad.isEmpty() ? '' : signaturePad.toDataURL();
        };
      </script>
    </body>
    </html>
  `;

  const handleClear = () => {
    webViewRef.current?.injectJavaScript('window.clearSignature(); true;');
  };

  const handleSave = () => {
    webViewRef.current?.injectJavaScript(
      'window.ReactNativeWebView.postMessage(window.getSignature()); true;'
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Draw Signature</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={[styles.signaturePadContainer, { height: windowHeight * 0.5 }]}>
            <WebView
              ref={webViewRef}
              source={{ html }}
              style={styles.webview}
              onMessage={(event) => {
                const signature = event.nativeEvent.data;
                onSave(signature);
                onClose();
              }}
              scrollEnabled={false}
              bounces={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  signaturePadContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  webview: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  clearButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ef4444',
  },
  saveButton: {
    flex: 2,
    padding: 12,
    backgroundColor: '#3E7BFA',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
  },
});