get_countries <- function(per_page = 100){
    n_page <- per_page
    page <- 0
    dt <- data.table(
        "Country" = NA
        , "Region" = NA
    )
    while(n_page == per_page){
        page <- page + 1
        query <- list(format = "JSON", per_page = per_page, page = page)
        country_url <- "http://api.worldbank.org/v2/countries"
        response <- content(GET(country_url, query = query))[[2]]
        n_page <- length(response)
        if(n_page == 0){
            stop("The request failed")
        } else {
            temp <- rbindlist(lapply(1:n_page, function(x){
                data.table(
                    "Country" = response[[x]]$name
                    , "Region" = response[[x]]$region$value
                )
            }))
        }
        dt <- rbindlist(list(dt, temp))
    }
    dt[-1]
}

get_data <- function(indicator = "SP.POP.TOTL", per_page = 100, mrnev = "1"){
    n_page <- per_page
    page <- 0
    dt <- data.table(
        "Country" = NA
        , "Year" = NA
        , "Value" = NA
    )
    while(n_page == per_page){
        page <- page + 1
        query <- list(per_page = per_page, page = page, format = "JSON", MRNEV = mrnev)
        response <- content(
            GET(paste0("http://api.worldbank.org/v2/countries/all/indicators/", indicator)
                , query = query)
        )[[2]]
        n_page <- length(response)
        if(n_page == 0){
            stop("The request failed")
        } else {
            temp <- rbindlist(lapply(1:n_page, function(x){
                data.table(
                    "Country" = response[[x]]$country$value
                    , "Year" = response[[x]]$date
                    , "Value" = response[[x]]$value
                )
            }))
        }
        dt <- rbindlist(list(dt, temp))
    }
    
    merge(dt[-1][order(-Value)][Country %in% countries[!Region %in% "Aggregates", Country]], countries)
}

merge_wb <- function(x, y){merge(
    x[, colnames(x)[!colnames(x) %in% "Year"], with = F]
    ,y[, colnames(y)[!colnames(y) %in% "Year"], with = F]
    ,all=FALSE,by="Country")
}

p <- function(d){
    plot_ly(
        data = d
        , x = ~Value.x
        , y = ~Value.y
        , z = ~Value
        , color = ~Region
        , text = ~paste0(Country)
        , hoverinfo = "text"
        # , marker = list(color='green')
        # , showlegend = F
    )
}

# Iteraciones
iteraciones <- function(){
    pop <- get_data("SP.POP.TOTL") # Population
    gni <- get_data("NY.GNP.PCAP.PP.CD")[, Value := log(Value)] # GNI per capita, PPP (current international $)
    leb <- get_data("SP.DYN.LE00.IN") # Life expectancy at birth, total (years)
    int <- get_data("IT.NET.USER.ZS") # Individuals using the Internet (% of population)
    rnd <- get_data("GB.XPD.RSDV.GD.ZS")[, Value := log(Value)] # Research and Development (% GDP)
    ate <- get_data("EG.ELC.ACCS.UR.ZS") # Access to electricity, urban (% of urban population)
    eia <- get_data("SL.AGR.EMPL.ZS") # Employment in agriculture (% of total employment) (modeled ILO estimate)
    rrd <- get_data("SP.POP.SCIE.RD.P6") # Researchers in R&D (per million people)
    csi <- get_data("per_si_allsi.cov_pop_tot") # Coverage of social insurance programs (% of population)
    lft <- get_data("SL.TLF.TOTL.IN") # Labor force, total
    itna <- get_data("ST.INT.ARVL") # International tourism, number of arrivals
    edb <- get_data("IC.BUS.EASE.XQ") # Ease of doing business index (1=most business-friendly regulations)
    ite <- get_data("ST.INT.XPND.MP.ZS") # International tourism, expenditures (% of total imports)
    igs <- get_data("NE.IMP.GNFS.ZS") # Imports of goods and services (% of GDP)
    lpi <- get_data("LP.LPI.OVRL.XQ")[, Value := log(Value)] # Logistics performance index: Overall (1=low to 5=high)
    ppg <- get_data("EP.PMP.SGAS.CD") # Pump price for gasoline (US$ per liter)
    chw <- get_data("SH.MED.CMHW.P3") # Community health workers (per 1,000 people)
    p25h <- get_data("SH.UHC.OOPC.25.ZS") # Proportion of population spending more than 25% of household consumption or income on out-of-pocket health care expenditure (%)
    uae <- get_data("SL.UEM.ADVN.ZS") # Unemployment with advanced education (% of total labor force with advanced education)
    uie <- get_data("SL.UEM.INTM.ZS") # Unemployment with intermediate education (% of total labor force with intermediate education)
    ube <- get_data("SL.UEM.BASC.ZS") # Unemployment with basic education (% of total labor force with basic education)
    bash <- get_data("SH.STA.BRTC.ZS") # Births attended by skilled health staff (% of total)
    wids <- get_data("SG.DMK.SRCR.FN.ZS") # Women making their own informed decisions regarding sexual relations, contraceptive use and reproductive health care (% of women age 15-49)
    cum <- get_data("SH.CON.1524.MA.ZS") # Condom use, population ages 15-24, male (% of males ages 15-24)
    pwsv <- get_data("SG.VAW.1549.ZS") # Proportion of women subjected to physical and/or sexual violence in the last 12 months (% of women age 15-49)
    egs <- get_data("NE.EXP.GNFS.ZS")[, Value := log(Value)] # Exports of goods and services (% of GDP)
    gne <- get_data("NE.DAB.TOTL.ZS")[, Value := log(Value)] # Gross national expenditure (% of GDP)
    
    hist(egs$Value)
    hist(int$Value)
    hist(ite$Value)
    hist(ppg$Value)
}
