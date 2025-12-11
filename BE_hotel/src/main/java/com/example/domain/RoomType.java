// Enum loại phòng: SINGLE, DOUBLE, DELUXE, SUITE, FAMILY, PREMIUM (với tên hiển thị, dung tích)
package com.example.domain;

public enum RoomType {
    SINGLE("Single Room", 1, 2),
    DOUBLE("Double Room", 2, 2),
    DELUXE("Deluxe Room", 2, 3),
    SUITE("Suite Room", 2, 4),
    FAMILY("Family Room", 4, 6),
    PREMIUM("Premium Room", 2, 3);

    private final String displayName;
    private final int minCapacity;
    private final int maxCapacity;

    RoomType(String displayName, int minCapacity, int maxCapacity) {
        this.displayName = displayName;
        this.minCapacity = minCapacity;
        this.maxCapacity = maxCapacity;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMinCapacity() {
        return minCapacity;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }
}
