package com.holcim.reportesprev;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
        }
    }

    private class AndroidBridge {
        @JavascriptInterface
        public void saveAndShare(String base64Data, String fileName, String mimeType) {
            try {
                String safeName = (fileName == null || fileName.isEmpty()) ? "reporte.pdf" : fileName.replaceAll("[\\\\/:*?\"<>|]", "-");
                String safeMime = (mimeType == null || mimeType.isEmpty()) ? "application/pdf" : mimeType;
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);

                // Also store a copy in Downloads on Android 10+ (Scoped Storage)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    try {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.Downloads.DISPLAY_NAME, safeName);
                        values.put(MediaStore.Downloads.MIME_TYPE, safeMime);
                        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ReportesPrev");
                        Uri dlUri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                        if (dlUri != null) {
                            try (OutputStream out = getContentResolver().openOutputStream(dlUri)) {
                                if (out != null) {
                                    out.write(bytes);
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }

                // Write to cacheDir for FileProvider sharing (Drive, WhatsApp, PDF viewers)
                File outFile = new File(getCacheDir(), safeName);
                try (FileOutputStream fos = new FileOutputStream(outFile)) {
                    fos.write(bytes);
                }

                Uri contentUri = FileProvider.getUriForFile(
                    MainActivity.this,
                    getPackageName() + ".fileprovider",
                    outFile
                );

                runOnUiThread(() -> {
                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType(safeMime);
                    shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    shareIntent.putExtra(Intent.EXTRA_SUBJECT, safeName);
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    Intent chooser = Intent.createChooser(shareIntent, safeName);
                    chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(chooser);
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                if (bridge != null && bridge.getWebView() != null) {
                    WebView webView = bridge.getWebView();
                    PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null) {
                        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter("ReportePreventivo");
                        printManager.print("ReportePreventivo", adapter, new PrintAttributes.Builder().build());
                    }
                }
            });
        }
    }
}
