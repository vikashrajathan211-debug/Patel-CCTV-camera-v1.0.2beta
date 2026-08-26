package com.patelcctv.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Run camera and heavy initialization asynchronously on a background thread
        Executors.newSingleThreadExecutor().execute(this::initCamera);
    }

    private void initCamera() {
        // Background camera and hardware warmup logic
    }
}

