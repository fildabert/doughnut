package com.odde.doughnut.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.odde.doughnut.entities.json.WikidataEntity;
import java.io.IOException;
import java.util.Map;

public record WikidataService(HttpClientAdapter httpClientAdapter, String wikidataBaseUrl) {

  public WikidataEntity fetchWikiData(String wikiDataId) throws IOException, InterruptedException {
    String responseBody = httpClientAdapter.getResponseString(ConstructWikiDataUrl(wikiDataId));
    WikiDataModel wikiDataModel =
        getObjectMapper().readValue(responseBody, new TypeReference<>() {});
    WikiDataInfo wikiDataInfo = wikiDataModel.entities.get(wikiDataId);
    return new WikidataEntity(
        wikiDataInfo.GetEnglishTitle(), wikiDataInfo.GetEnglishWikipediaUrl());
  }

  private String ConstructWikiDataUrl(String wikiDataId) {
    return wikidataBaseUrl + "/wiki/Special:EntityData/" + wikiDataId + ".json";
  }

  private ObjectMapper getObjectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    return mapper;
  }

  public static class WikiDataModel {
    public Map<String, WikiDataInfo> entities;
  }
}