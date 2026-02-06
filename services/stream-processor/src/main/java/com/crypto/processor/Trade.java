package com.crypto.processor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Trade {

    private String symbol;
    private double price;
    private long ts;

    public Trade() {
        // Jackson needs a no-arg constructor
    }

    public String getSymbol() {
        return symbol;
    }

    public double getPrice() {
        return price;
    }

    public long getTs() {
        return ts;
    }
}
