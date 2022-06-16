package com.odde.doughnut.entities.json;

import java.util.Map;

public class WikidataSearchEntity {
  public String id;
  public String title;
  public int pageid;
  public WikidataDisplayEntity display;
  public String repository;
  public String url;
  public String concepturi;
  public String label;
  public String description;
  public WikidataMatchEntity match;

  public WikidataSearchEntity(Map<String, Object> obj) {
    this.id = (obj.get("id") != null) ? obj.get("id").toString() : "";
    this.title = (obj.get("title") != null) ? obj.get("title").toString() : "";
    this.pageid = (obj.get("pageid") != null) ? Integer.parseInt(obj.get("pageid").toString()) : 0;
    @SuppressWarnings("unchecked")
    WikidataDisplayEntity _display =
        new WikidataDisplayEntity((Map<String, Object>) obj.get("display"));
    this.display = _display;
    this.repository = (obj.get("repository") != null) ? obj.get("repository").toString() : "";
    this.url = (obj.get("url") != null) ? obj.get("url").toString() : "";
    this.concepturi = (obj.get("concepturi") != null) ? obj.get("concepturi").toString() : "";
    this.label = (obj.get("label") != null) ? obj.get("label").toString() : "";
    this.description = (obj.get("description") != null) ? obj.get("description").toString() : "";
    @SuppressWarnings("unchecked")
    WikidataMatchEntity _match = new WikidataMatchEntity((Map<String, Object>) obj.get("match"));
    this.match = _match;
  }
}