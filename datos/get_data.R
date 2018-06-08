require(data.table)
require(httr)
require(plotly)
source(file = "datos/functions.R")

countries <- get_countries()[!Region %in% "Aggregates",]

gni <- get_data("NY.GNP.PCAP.PP.CD", mrnev = "9")[, Value := log(Value)] # GNI per capita, PPP (current international $)
gne <- get_data("NE.DAB.TOTL.ZS", mrnev = "9")[, Value := log(Value)] # Gross national expenditure (% of GDP)
rnd <- get_data("GB.XPD.RSDV.GD.ZS", mrnev = "9")[, Value := log(Value)] # Research and Development (% GDP)

xy <- merge(gni, gne, by = c("Country", "Year", "Region"))
xyz <- merge(xy, rnd, by = c("Country", "Year", "Region"))

p(xyz) 

# X: GNI per capita, PPP (current international $)
# Y: Gross national expenditure (% of GDP)
# Z: Research and Development (% GDP)
