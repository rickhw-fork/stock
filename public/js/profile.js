/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
const user_name = localStorage.getItem('name');
const final_result = JSON.parse(localStorage.getItem('final_result'));
const finishDate = parseInt(localStorage.getItem('finishDate'));
// const clone = document.querySelector('.rank_table thead').cloneNode(true);
main();
async function main() {
  if (!localStorage.getItem('token')) {
    Swal.fire('please sign up or sign in!');
    window.location.href = './sign.html';
  } else {
    if (finishDate) {
      setInterval(countdown, 1000);
    }
    if (final_result) {
      const time_remain = document.querySelector('.time_remain');
      time_remain.innerHTML = '時間到， 結算';
      const main_nav = document.querySelector('.main-nav');
      main_nav.innerHTML = `<li><a href="./result.html">最終結果</a></li>
        <li><a href="./rank.html">排行榜</a></li>
        <li><a href="./resultnews.html">最新新聞</a></li>
        <li><a href="./resultreport.html">最新財報</a></li>
        <li id='leave'><a onclick= "leave()">結束遊戲</a></li>
        <li id="member_name"></li>
        <img src="imgs/member.png" onclick = "sign()"/>`;
      if (user_name) {
        const member_name = document.querySelector('#member_name');
        member_name.innerHTML = user_name;
      }
    }

    const bearer = `Bearer ${localStorage.getItem('token')}`;
    fetch('api/1.0/user/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: bearer,
      },
      method: 'GET',
    }).then((res) => res.json())
      .then((result) => {
        if (result.error) {
          Swal.fire(result.error);
          localStorage.removeItem('token');
          localStorage.removeItem('name');
          window.location.href = './sign.html';
        } else {
          const hello = document.createElement('p');
          hello.innerHTML = `名稱：${result.data.name}`;
          const username = document.querySelector('.username');
          username.appendChild(hello);
          const userEmail = document.createElement('p');
          userEmail.innerHTML = `電子信箱: ${result.data.email}`;
          const email = document.querySelector('.email');
          email.appendChild(userEmail);
        }
      });
  }
}

async function get_rank() {
  const rank = await fetch('api/1.0/stock/result', {
    method: 'GET',
  }).then((res) => res.json());
  const list = document.querySelector('.list');
  list.innerHTML = '';
  const rank_table = document.createElement('table');
  rank_table.setAttribute('class', 'rank_table');
  rank_table.innerHTML = `
  <thead>
    <tr align="center" bgcolor="#d7e6f4" height="23px">  
      <td rowspan="2"><nobr>名次</nobr></td>  
      <td rowspan="2"><nobr>玩家</nobr></td>  
      <td rowspan="2"><nobr>市值 (萬)</nobr></td>
      <td rowspan="2"><nobr>總報酬率</nobr></td>
      <td rowspan="2"><nobr>投資金額<br> (萬)</nobr></td>
      <td rowspan="2"><nobr>投資報酬率</nobr></td>
      <td rowspan="2"><nobr>投資選擇</nobr></td>
      <td rowspan="2"><nobr>當時股票</nobr></td>
      <td rowspan="2"><nobr>當時日期</nobr></td>
      <td rowspan="2"><nobr>完成日期</nobr></td>
      <td rowspan="2"><nobr>對手</nobr></td>
    </tr>
  </thead>`;
  let rank_tbody = document.querySelector('.rank_table tbody');
  if (rank_tbody) {
    rank_tbody.innerHTML = '';
  } else {
    rank_tbody = document.createElement('tbody');
  }
  list.appendChild(rank_table);
  rank_table.appendChild(rank_tbody);
  for (let i = 0; i < rank.length; i++) {
    if (rank[i].name == user_name) {
      if (!rank[i].portfolio) {
        // no finish game
        continue;
      }
      const portfolio_json = JSON.parse(rank[i].portfolio);
      addTable(rank_tbody, rank, i, portfolio_json);
    }
  }
}



async function get_pk() {
  let rank = await fetch('api/1.0/stock/result', {
    method: 'GET',
  }).then((res) => res.json());

  rank = rank.sort((a, b) => b.finishdate - a.finishdate);
  const list = document.querySelector('.list');
  list.innerHTML = '';

  for (let i = 0; i < rank.length; i++) {
    if (rank[i].opponent && rank[i].name == user_name) {
      if (!rank[i].portfolio) {
        // no finish game
        continue;
      }
      const portfolio_json = JSON.parse(rank[i].portfolio);
      const title = document.createElement('h2');
      title.innerHTML = `對戰 ${rank[i].opponent}`;
      const rank_table = document.createElement('table');
      rank_table.setAttribute('class', 'rank_table');
      list.append(title, rank_table);
      const rank_thead = document.createElement('thead');
      rank_thead.innerHTML = `
        <tr align="center" bgcolor="#d7e6f4" height="23px">   
          <td rowspan="2"><nobr>玩家</nobr></td>  
          <td rowspan="2"><nobr>市值 (萬)</nobr></td>
          <td rowspan="2"><nobr>總報酬率</nobr></td>
          <td rowspan="2"><nobr>投資金額<br> (萬)</nobr></td>
          <td rowspan="2"><nobr>投資報酬率</nobr></td>
          <td rowspan="2"><nobr>投資選擇</nobr></td>
          <td rowspan="2"><nobr>當時股票</nobr></td>
          <td rowspan="2"><nobr>當時日期</nobr></td>
          <td rowspan="2"><nobr>完成日期</nobr></td>
          <td rowspan="2"><nobr>對手</nobr></td>
        </tr>`;
      const rank_tbody = document.createElement('tbody');
      rank_table.append(rank_thead, rank_tbody);
      addTable(rank_tbody, rank, i, portfolio_json, 'true');
      // search opponent's data
      for (let k = 0; k < rank.length; k++) {
        if (rank[k].name == rank[i].opponent && rank[k].finishdate == rank[i].finishdate) {
          if (!rank[k].portfolio) {
            // no finish game
            break;
          }
          addOpponent(k, rank, rank_tbody);
          if (rank[i].totalmoney > rank[k].totalmoney) {
            title.innerHTML += ' <strong> 勝</strong>';
          } else if (rank[i].totalmoney == rank[k].totalmoney) {
            title.innerHTML += ' <strong> 平手</strong>';
          } else {
            title.innerHTML += ' <strong> 負</strong>';
          }
          // title.innerHTML += ` @ ${getDateTime(parseInt(rank[i].finishdate)).split(' ')[0]}`;
        }
      }
    }
  }
}

function addOpponent(k, rank, rank_tbody) {
  const portfolio_json = JSON.parse(rank[k].portfolio);
  addTable(rank_tbody, rank, k, portfolio_json, 'true');
}

function addTable(rank_tbody, rank, i, portfolio_json, pkBoolean) {
  const row = document.createElement('tr');
  row.setAttribute('class', 'row');
  const rank_number = document.createElement('td');
  rank_number.innerHTML = i + 1;
  const username = document.createElement('td');
  username.innerHTML = rank[i].name;
  const totalmoney = document.createElement('td');
  totalmoney.innerHTML = rank[i].totalmoney;
  const total_ratio = document.createElement('td');
  total_ratio.innerHTML = `${rank[i].total_ratio} %`;

  const invest_total = document.createElement('td');
  invest_total.innerHTML = (portfolio_json.total / 10).toFixed(3) * 1000 / 1000;
  const invest_ratio = document.createElement('td');
  invest_ratio.innerHTML = `${rank[i].invest_ratio} %`;

  const portfolio = document.createElement('td');
  // portfolio.innerHTML = rank[i].portfolio;
  for (let j = 0; j < portfolio_json.list.length; j++) {
    if (portfolio_json.list[j].buyShort_value == 'buy') {
      portfolio.innerHTML += `買進 ${portfolio_json.list[j].stock_name} 
      ${portfolio_json.list[j].qty} 張，成本 ${(portfolio_json.list[j].total_price / 10).toFixed(3) * 1000 / 1000} 萬<br>`;
      const ratio = ((portfolio_json.list[j].now_price_value
        - portfolio_json.list[j].price) / portfolio_json.list[j].price * 100).toFixed(2)
        * 100 / 100;
      if (ratio > 0) {
        portfolio.innerHTML += `報酬率：<span style="color:red">${ratio}</span> %， `;
      } else if (ratio < 0) {
        portfolio.innerHTML += `報酬率：<span style="color:green">${ratio}</span> %， `;
      }
      const earn = (ratio * portfolio_json.list[j].total_price / 1000).toFixed(2) * 100 / 100;
      portfolio.innerHTML += `獲利： ${earn}  萬 <br>`;
    } else {
      portfolio.innerHTML += `放空 ${portfolio_json.list[j].stock_name} 
      ${portfolio_json.list[j].qty} 張，成本 ${(portfolio_json.list[j].total_price / 10).toFixed(3) * 1000 / 1000} 萬<br>`;
      const ratio = ((portfolio_json.list[j].now_price_value
        - portfolio_json.list[j].price) / portfolio_json.list[j].price * 100).toFixed(2)
        * 100 / 100 * (-1);
      if (ratio > 0) {
        portfolio.innerHTML += `報酬率：<span style="color:red">${ratio}</span> %， `;
      } else if (ratio < 0) {
        portfolio.innerHTML += `報酬率：<span style="color:green">${ratio}</span> %， `;
      }
      const earn = (ratio * portfolio_json.list[j].total_price / 1000).toFixed(2) * 100 / 100;
      portfolio.innerHTML += `獲利： ${earn}  萬 <br>`;
    }
  }
  const playstock = document.createElement('td');
  const playstock_json = JSON.parse(rank[i].playstock);
  for (let j = 0; j < playstock_json.length; j++) {
    playstock.innerHTML += `${playstock_json[j].id} 
    ${playstock_json[j].stock} <br>`;
  }
  const playdate = document.createElement('td');
  playdate.innerHTML = rank[i].playdate;
  const finishdate = document.createElement('td');
  finishdate.innerHTML = getDateTime(parseInt(rank[i].finishdate));
  const opponent = document.createElement('td');
  opponent.innerHTML = rank[i].opponent;
  if (pkBoolean !== 'true') {
    row.append(rank_number, username, totalmoney, total_ratio, invest_total, invest_ratio,
      portfolio, playstock, playdate, finishdate, opponent);
  } else {
    row.append(username, totalmoney, total_ratio, invest_total, invest_ratio,
      portfolio, playstock, playdate, finishdate, opponent);
  }

  rank_tbody.appendChild(row);
}



function logOut() {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('playDate');
  localStorage.removeItem('playStock');
  localStorage.removeItem('finishDate');
  localStorage.removeItem('final_result');
  window.location.href = './sign.html';
}

