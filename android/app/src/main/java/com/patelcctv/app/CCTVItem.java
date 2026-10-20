package com.patelcctv.app;

import com.google.firebase.database.IgnoreExtraProperties;

/**
 * CCTV Item model for Firebase Realtime Database.
 * Represents camera items under the "CCTV_Items" node.
 */
@IgnoreExtraProperties
public class CCTVItem {
    public String itemId;
    public String itemName;
    public String itemStatus;

    // खाली कॉन्स्ट्रक्टर Firebase के लिए जरूरी है
    public CCTVItem() {
    }

    public CCTVItem(String itemId, String itemName, String itemStatus) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemStatus = itemStatus;
    }

    // Getters and Setters
    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemStatus() {
        return itemStatus;
    }

    public void setItemStatus(String itemStatus) {
        this.itemStatus = itemStatus;
    }

    // Convenience compatibility methods
    public String getName() {
        return itemName;
    }

    public void setName(String name) {
        this.itemName = name;
    }

    public String getPriceOrStatus() {
        return itemStatus;
    }

    public void setPriceOrStatus(String priceOrStatus) {
        this.itemStatus = priceOrStatus;
    }
}
