require(data.table)
require(httr)
require(plotly)
source(file = "datos/functions.R")

countries <- get_countries()[!Region %in% "Aggregates",]

gni <- get_data("NY.GNP.PCAP.PP.CD", mrnev = "9")[, Value := log(Value)] # GNI per capita, PPP (current international $)
gne <- get_data("NE.DAB.TOTL.ZS", mrnev = "9")[, Value := log(Value)] # Gross national expenditure (% of GDP)
rnd <- get_data("GB.XPD.RSDV.GD.ZS", mrnev = "9")[, Value := log(Value)] # Research and Development (% GDP)

gni$Year <- head(rep(seq(1,9), ceiling(nrow(gni)/9)), nrow(gni))
gne$Year <- head(rep(seq(1,9), ceiling(nrow(gne)/9)), nrow(gne))
rnd$Year <- head(rep(seq(1,9), ceiling(nrow(rnd)/9)), nrow(rnd))

xy <- merge(gni, gne, by = c("Country", "Year", "Region"))
xyz <- merge(xy, rnd, by = c("Country", "Year", "Region"))

# X: GNI per capita, PPP (current international $)
# Y: Gross national expenditure (% of GDP)
# Z: Research and Development (% GDP)

p(xyz) 
write.table(xyz, "datos/data.csv", sep = ",", na = "", row.names = F, fileEncoding = "utf-8")
write.table(xyz[,.(x =Value.x, y = Value.y, z = Value)], "datos/data_xyz.csv", sep = ",", na = "", row.names = F, fileEncoding = "utf-8")
