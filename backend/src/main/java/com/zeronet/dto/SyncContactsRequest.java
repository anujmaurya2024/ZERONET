package com.zeronet.dto;

import java.util.List;

public class SyncContactsRequest {
    private List<ContactItemDto> contacts;

    public SyncContactsRequest() {}

    public SyncContactsRequest(List<ContactItemDto> contacts) {
        this.contacts = contacts;
    }

    public List<ContactItemDto> getContacts() {
        return contacts;
    }

    public void setContacts(List<ContactItemDto> contacts) {
        this.contacts = contacts;
    }
}
