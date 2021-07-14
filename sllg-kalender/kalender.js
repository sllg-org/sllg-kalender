(function($) {
  "use strict";

  $(document).ready(function() {
    // veranstaltungen in widget
    /*
        var veranstaltungen = [
          {
            titel: 'Titel1',
            teaser: 'Teaser 1',
            morelink: 'http://example.org',
            kategorie: '2',
            "termine": [
              {
                "datum": "2017-04-21",
                "vonUhrzeit": "10:00",
                "bisUhrzeit": "18:00",
                "bemerkung": ""
              }
            ]
          }
        ];
    */

    // nach data-attibute filtern
    $.fn.filterByData = function(prop, val) {
      return this.filter(function() {
        var f = $(this)
          .data(prop)
          .indexOf(val);
        if (f >= 0) {
          return true;
        } else {
          return false;
        }
      });
    };

    var letzterTermin = new Date();
    for (let i = 0; i < veranstaltungen.length; i++) {
      for (let t = 0; t < veranstaltungen[i].termine.length; t++) {
        let bis = parseDateWegenSafari(veranstaltungen[i].termine[t]["datum"]);
        if (bis > letzterTermin) {
          letzterTermin = bis;
        }
      }
    }
    // kalender erzeugen
    var heute = new Date();
    var aktMonat = heute.getMonth() + 1;
    var aktJahr = heute.getFullYear();

    var letzterMonat = letzterTermin.getMonth() + 1;
    var letztesJahr = letzterTermin.getFullYear();

    var deltaJahre = letztesJahr - aktJahr;

    var kategorieFilters = new Object();

    if (deltaJahre == 0) {
      // gleiches Jahr
      for (var i = aktMonat; i <= letzterMonat; i++) {
        createMonat(aktJahr + "-" + i);
      }
    } else if (deltaJahre == 1) {
      // dieses und naechstes Jahr
      for (var i = aktMonat; i <= 12; i++) {
        createMonat(aktJahr + "-" + i);
      }
      for (var i = 1; i <= letzterMonat; i++) {
        createMonat(letztesJahr + "-" + i);
      }
    } else if (deltaJahre > 1) {
      // mehr als 1 Jahr
      for (var i = aktMonat; i <= 12; i++) {
        createMonat(aktJahr + "-" + i);
      }
      for (var i = aktJahr + 1; i < letztesJahr; i++) {
        for (var j = 1; j <= 12; j++) {
          createMonat(i + "-" + j);
        }
      }
      for (var i = 1; i <= letzterMonat; i++) {
        createMonat(letztesJahr + "-" + i);
      }
    }

    // veranstaltungen eintragen
    var wochentage = [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag"
    ];

    for (let i = 0; i < veranstaltungen.length; i++) {
        var morelink = veranstaltungen[i]["morelink"];
        var titel = veranstaltungen[i]["titel"];
        var teaser = veranstaltungen[i]["teaser"];
        var kategorie = veranstaltungen[i]["kategorie"];
      for (let t = 0; t < veranstaltungen[i].termine.length; t++) {       
        var datum = parseDateWegenSafari(veranstaltungen[i].termine[t]["datum"]);
        //var bis = parseDateWegenSafari(veranstaltungen[i]['datum']).getDate();
        var tag = datum.getDate();
        //var bisTag = bis.getDate();
        var jahr = datum.getFullYear();
        var monat = datum.getMonth() + 1;
        var weekDay = datum.getDay();
        var vonUhrzeit = veranstaltungen[i].termine[t]["vonUhrzeit"];
        var bisUhrzeit = veranstaltungen[i].termine[t]["bisUhrzeit"];

        var dateStr =
          wochentage[weekDay] +
          ", " +
          (tag < 10 ? "0" + tag : tag) +
          "." +
          (monat < 10 ? "0" + monat : monat) +
          "." +
          jahr;

        if (vonUhrzeit.length) {
          dateStr += " - " + vonUhrzeit;
        }
        if (bisUhrzeit.length) {
          dateStr += " bis " + bisUhrzeit;
        }

        //var diffDays = Math.round(Math.abs((bis - von)/(24*60*60*1000)));

        //??? Veranstaltungen ueber mehrere Tage, Monatsuebergang, Jahresuebergang ?

        // veranstaltungen eintragen
        var cell = $(
          "#kK" + jahr + "" + (monat < 10 ? "0" : "") + monat + " .d" + tag
        );
        //cell.append(
          $(".kalenderAnsicht .terminDetail").append(
          '<div class="terminKalenderKategorie" data-kategorie="' +
            kategorie +
            '">' +
            '<div class="anchor">' +
            '<div class="terminKalenderPopup">' +
            '<div class="terminKalenderDate">' +
            dateStr +
            "</div>" +
            '<div class="terminKalenderTitel"><a href="' +
            morelink +
            '">' +
            titel +
            "</a></div>" +
            '<div class="terminKalenderTeaser">' +
            teaser +
            "</div>" +
            "</div></div></div>"
        );
        cell.addClass("has terminKalenderKategorie kategorie-" + kategorie);
      }
    }

    // overflow fuer widget ausschalten
    $(".veranstaltungskalender")
      .parent()
      .css("overflow", "visible");


    // event handler

    // handler fuer vor- und folgemonat
    $(".vor, .zurueck").bind("click", function(e) {
      var sheet = $(this)
        .parent()
        .parent();
      var next;
      var current = Number(sheet.attr("id").substring(2));

      if ($(this).hasClass("vor"))
        if (String(current).substring(4) == "12") {
          next = current + 89;
        } else {
          next = current + 1;
        }
      else {
        if (String(current).substring(4) == "01") {
          next = current - 89;
        } else {
          next = current - 1;
        }
      }

      var show = $("#kK" + next);
      if (show.length) {
        sheet.hide();
        show.show();
        $(".kalenderAnsicht .day").removeClass("active");
        //$(".kalenderAnsicht .terminDetail").html("");
      }
    });

    //
    $(".veranstaltungsHeader .btn-group").on("click", ".btn", function(e) {
      e.preventDefault();
      var btn = $(this);
      if (btn.hasClass("active")) return;

      $(".veranstaltungsHeader .btn-group .btn").removeClass("active");
      btn.addClass("active");
    });

    $(".veranstaltungskalender").on("touchend", ".day span", function(e) {
      if (!isMobile) return;

      $(".veranstaltungskalender .day").removeClass("active");

      var day = $(this).closest(".day");
      day.addClass("active");

      $(".kalenderAnsicht .terminDetail").html(
        day
          .find(".terminKalenderPopup")
          .not(".hidden")
          .clone()
      );

      var sheet = $(this).closest(".kalenderKalender");
      var calTop = sheet.offset().top - 20;
      var scrollTop = $("body").scrollTop();

      if (calTop > scrollTop) {
        $("body").scrollTop(calTop);
      }
    });

    // ----- kalender HTML erzeugen -------------------------------------------------------------------------------------
    function createMonat(datum) {
      var aktDatum;
      if (datum != "") {
        aktDatum = parseDateWegenSafari(datum + "-2-2-2");
      }

      if (!aktDatum.getFullYear()) {
        aktDatum = new Date();
      }

      var heute = new Date();
      var aktMonat = aktDatum.getMonth() + 1;

      var vorMonat = aktMonat == 1 ? 12 : aktMonat - 1;
      var folgeMonat = aktMonat == 12 ? 1 : aktMonat + 1;
      // korrektur jahreswechsel
      if (aktMonat == 1) vorMonat = 12;
      var aktJahr = aktDatum.getFullYear();
      var prevJahr = aktMonat == 1 ? aktJahr - 1 : aktJahr;
      var nextJahr = aktMonat == 12 ? aktJahr + 1 : aktJahr;
      var tageImMonat = new Date(aktJahr, aktMonat, 0).getDate();
      var tageImVormonat = new Date(aktJahr, vorMonat, 0).getDate();
      var monatBeginntMit = new Date(aktJahr, aktMonat - 1, 1).getDay();
      var monatEndetMit = new Date(aktJahr, aktMonat - 1, tageImMonat).getDay();
      var zeile = "";
      var offset = 0;
      var kalenderDiv = "kK" + aktJahr + (aktMonat < 10 ? "0" : "") + aktMonat;

      //var wochentage = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
      var Monatsnamen = [
        "",
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
      ];

      // erzeuge HTML
      $(".kalenderAnsicht").prepend(
        '<div class="kalenderKalender" id="' +
          kalenderDiv +
          '"><div class="monthnavi"></div></div>'
      );
      $("#" + kalenderDiv + " .monthnavi").append(
        '<span class="zurueck">&larr;</span><span class="h3">' +
          Monatsnamen[aktMonat] +
          " " +
          aktJahr +
          '</span><span class="vor">&rarr;</span>'
      );
      $("#" + kalenderDiv).append(
        '<div class="table"><table><tr><th>Mo</th><th>Di</th><th>Mi</th><th>Do</th><th>Fr</th><th class="wochenende">Sa</th><th class="wochenende">So</th></tr></table></div>'+
        '<div class="terminDetail"></div>'
      );

      // verstecke den nicht aktuellen
      if (aktJahr != heute.getFullYear() || aktMonat - 1 != heute.getMonth()) {
        $("#" + kalenderDiv).hide();
      }
      // ueber alle Tage des monats
      // offset Monatsanfang
      if (monatBeginntMit == 0) {
        offset = 6;
      } else {
        offset = monatBeginntMit - 1;
      }
      for (var i = 0; i < offset; i++) {
        zeile += '<td class="offset"></td>';
      }

      // tag
      for (var i = 1; i <= tageImMonat; i++) {
        var right =
          (i + offset) % 7 > 4 || (i + offset) % 7 == 0 ? " right" : "";
        zeile +=
          '<td><div class="day d' +
          i +
          right +
          '"><span>' +
          i +
          "</span></div></td>";
        // neue Woche, neue Zeile
        if ((i + offset) % 7 == 0) {
          $("#" + kalenderDiv + " table").append("<tr>" + zeile + "</tr>");
          zeile = "";
        }
      }
      // offset Monatsende
      if (monatEndetMit != 0) {
        for (var i = 0; i < 7 - monatEndetMit; i++) {
          zeile += '<td class="offset"></td>';
        }
      }
      $("#" + kalenderDiv + " table").append("<tr>" + zeile + "</tr>");
    }

    /**
     * wandelt string '2014-05-15' in date mit Uhrzeit 12:00
     * @param {string} datum
     * return date
     */
    function parseDateWegenSafari(datum) {
      var a = datum.split("-");
      return new Date(a[0], Number(a[1]) - 1, a[2], 12, 0);
    }
  });
})(jQuery);
