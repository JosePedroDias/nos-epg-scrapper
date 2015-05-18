# NOS EPG SCRAPPER

Attempting to webscrap NOS EPG data.


## API


### getChannels

```javascript

s.getChannels(cb);

=>

[
    (...)
    {"name": "SIC Notícias", "number": "9"},
    {"name": "SIC Mulher", "number": "71"}
    (...)
]
```


### getChannel

```javascript

s.getChannel(channelId, cb);

=>

{
  "name": "+TVI",
  "logo": "//images.nos.pt/EPGChannelImages/MAISTVISD.png",
  "acronym": "MAISTVISD",
  "progs": {
    "18": [
      {
        "id": "51288",
        "genre": "entretenimento",
        "title": "The Block All Stars",
        "startT": "00:00",
        "endT": "00:30"
      },
      {
        "id": "51289",
        "genre": "entretenimento",
        "title": "Tropa do Humor",
        "startT": "00:30",
        "endT": "01:00"
      },
      (...),
    "19" (...)
  ]
}
```

### getProgram

```javascript

s.getProgram(channelAcronym, programO, cb)

=>

{
  "title": "Informação Não Disponibilizada Pelo Canal",
  "desc": "Informação Não Disponibilizada Pelo Canal",
  "shot": "351546_resized_352x198.jpg",
  "startT": "00:00",
  "endT": "00:30",
  "channel": "+TVI",
  "startD": "2015-05-26T04:00:00+01:00",
  "endD": "2015-05-26T06:00:00+01:00",
  "dunno": "false"
}
```
