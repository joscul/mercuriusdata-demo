
var profit = _current.ttm.profit
var num_shares = _current.share.count
var num_shares_yesterday = _previous_day.share.count
var price_close = _current.price.close
var price_close_yesterday = _previous_day.price.close
var comp_names = _current.company.name
var todays_dividends = _current.event.dividends

// fill company_ids with ids of companies with negative profit
var company_ids = []
for (var company_id in profit) {
    if (profit[company_id] < 0) {
        company_ids.push(company_id)
    }
}

// initialize portfolio
// 117.45 is the initial value of OMXSGI at 2013-01-01
var portfolio = PORTFOLIO({
  index_value: 100,
  non_profitable_index_value: 117.45,
})

// calculate price_close * num_shares for today and yesterday
var sod_index_market_value_t = 0
for (var i in company_ids) {
    var company_id = company_ids[i]
    var market_share = price_close_yesterday[company_id] * num_shares_yesterday[company_id]
    sod_index_market_value_t += market_share
}

var index_market_value_t = 0
for (var i in company_ids) {
    var company_id = company_ids[i]
    var market_share = price_close[company_id] * num_shares[company_id]
    index_market_value_t += market_share
}

// calculate todays dividends sum
var dividend_market_value = 0
for (var i in company_ids) {
    var company_id = company_ids[i]
    var dividend_value = todays_dividends[company_id] * num_shares[company_id]
    if (dividend_value) {
        dividend_market_value += dividend_value
    }
}

// methodology see page 14 of https://www.nasdaq.com/docs/Methodology_NORDIC.pdf
var pr_index_divisor_t = sod_index_market_value_t / portfolio.index_value
var PR_t = index_market_value_t / pr_index_divisor_t
var IDP_t = dividend_market_value / pr_index_divisor_t
var GTR_t = portfolio.non_profitable_index_value * (PR_t + IDP_t) / portfolio.index_value

// store index values in portfolio
portfolio.index_value = PR_t
portfolio.non_profitable_index_value = GTR_t

PLOT(portfolio.non_profitable_index_value, "NEGATIVE PROFIT (TTM)")
PLOT(_current.index.omxsgi, "OMXSGI")
