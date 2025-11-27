package com.rishi.ecom.dto;

import com.rishi.ecom.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserDetailResponse {
    private User user;
    private long orderCount;
    private double totalSpend;
    private long productCount;
    private int rejectionCount;
}

