package com.zeronet.dto;

public class LanguageDto {
    private String code;
    private String name;
    private String nativeName;
    private String script;

    public LanguageDto() {
    }

    public LanguageDto(String code, String name, String nativeName, String script) {
        this.code = code;
        this.name = name;
        this.nativeName = nativeName;
        this.script = script;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNativeName() {
        return nativeName;
    }

    public void setNativeName(String nativeName) {
        this.nativeName = nativeName;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }
}
