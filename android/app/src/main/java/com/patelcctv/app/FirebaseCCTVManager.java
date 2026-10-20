package com.patelcctv.app;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.ArrayList;
import java.util.List;

/**
 * Manager class for handling CCTV Items in Firebase Realtime Database.
 * Operates on the "CCTV_Items" node.
 */
public class FirebaseCCTVManager {

    private static FirebaseCCTVManager instance;
    private final DatabaseReference databaseRef;

    public interface OnItemUploadCallback {
        void onSuccess(String itemId);
        void onFailure(Exception exception);
    }

    public interface OnItemsLoadedCallback {
        void onLoaded(List<CCTVItem> items);
        void onError(DatabaseError error);
    }

    private FirebaseCCTVManager() {
        // Firebase Database reference for "CCTV_Items"
        databaseRef = FirebaseDatabase.getInstance().getReference("CCTV_Items");
    }

    public static synchronized FirebaseCCTVManager getInstance() {
        if (instance == null) {
            instance = new FirebaseCCTVManager();
        }
        return instance;
    }

    public DatabaseReference getDatabaseReference() {
        return databaseRef;
    }

    /**
     * Uploads a new CCTV item to Firebase Realtime Database.
     * Generates a unique key with push().getKey().
     */
    public void uploadCCTVItem(String cameraName, String priceOrStatus, OnItemUploadCallback callback) {
        String itemId = databaseRef.push().getKey();
        if (itemId == null) {
            if (callback != null) {
                callback.onFailure(new Exception("Unable to generate unique key from Firebase"));
            }
            return;
        }

        CCTVItem newItem = new CCTVItem(itemId, cameraName, priceOrStatus);
        databaseRef.child(itemId).setValue(newItem)
                .addOnSuccessListener(aVoid -> {
                    if (callback != null) callback.onSuccess(itemId);
                })
                .addOnFailureListener(e -> {
                    if (callback != null) callback.onFailure(e);
                });
    }

    /**
     * Updates an existing CCTV item with new price/status.
     */
    public void updateCCTVItem(String itemId, String newPriceOrStatus, OnItemUploadCallback callback) {
        if (itemId == null || itemId.isEmpty()) {
            if (callback != null) callback.onFailure(new IllegalArgumentException("itemId cannot be empty"));
            return;
        }

        databaseRef.child(itemId).child("itemStatus").setValue(newPriceOrStatus)
                .addOnSuccessListener(aVoid -> {
                    if (callback != null) callback.onSuccess(itemId);
                })
                .addOnFailureListener(e -> {
                    if (callback != null) callback.onFailure(e);
                });
    }

    /**
     * Real-time listener for all CCTV items under "CCTV_Items".
     */
    public void listenToCCTVItems(OnItemsLoadedCallback callback) {
        databaseRef.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<CCTVItem> items = new ArrayList<>();
                for (DataSnapshot childSnapshot : snapshot.getChildren()) {
                    CCTVItem item = childSnapshot.getValue(CCTVItem.class);
                    if (item != null) {
                        items.add(item);
                    }
                }
                if (callback != null) {
                    callback.onLoaded(items);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                if (callback != null) {
                    callback.onError(error);
                }
            }
        });
    }
}
