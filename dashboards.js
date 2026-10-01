'use strict';

// All report data is illustrative. These controls never fetch client information.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const months = [
    {name:'April', short:'Apr', revenue:10.8, budget:11, cost:6.5, costBudget:6.6, opex:2.1, opexBudget:2.2, cash:3.2, opening:3, operating:.9, investing:-.4, financing:-.3, days:45},
    {name:'May', short:'May', revenue:11.6, budget:11.5, cost:6.9, costBudget:6.9, opex:2.2, opexBudget:2.2, cash:3.5, opening:3.2, operating:1, investing:-.4, financing:-.3, days:44},
    {name:'June', short:'Jun', revenue:11.2, budget:12, cost:6.7, costBudget:7.1, opex:2.2, opexBudget:2.3, cash:3.4, opening:3.5, operating:.8, investing:-.5, financing:-.4, days:46},
    {name:'July', short:'Jul', revenue:12.4, budget:12.2, cost:7.3, costBudget:7.2, opex:2.3, opexBudget:2.3, cash:3.6, opening:3.4, operating:1.1, investing:-.5, financing:-.4, days:43},
    {name:'August', short:'Aug', revenue:13.1, budget:12.5, cost:7.7, costBudget:7.4, opex:2.4, opexBudget:2.4, cash:3.7, opening:3.6, operating:1.2, investing:-.6, financing:-.5, days:41},
    {name:'September', short:'Sep', revenue:12.6, budget:13, cost:7.4, costBudget:7.6, opex:2.4, opexBudget:2.5, cash:4.1, opening:3.7, operating:1.3, investing:-.5, financing:-.4, days:42}
  ];
  const entities = [
    {name:'Entity A', revenue:12.6, cost:7.4, opex:2.4},
    {name:'Entity B', revenue:8.4, cost:5, opex:1.6},
    {name:'Entity C', revenue:6.1, cost:3.9, opex:1.2}
  ];
  const ageing = {
    ar: {label:'Receivables', total:8.4, buckets:[4.2,1.8,1.2,.7,.5], names:['Customer A','Customer B','Other customers'], balances:[[.8,.35,.2,.3,.25],[.6,.3,.25,.2,.15],[2.8,1.15,.75,.2,.1]]},
    ap: {label:'Payables', total:5.1, buckets:[3,1,.6,.3,.2], names:['Supplier A','Supplier B','Other suppliers'], balances:[[.9,.35,.2,.15,.1],[.6,.25,.15,.1,.05],[1.5,.4,.25,.05,.05]]}
  };
  const controllers = new Map();
  const money = value => `₹${value.toFixed(1)}m`;
  const signed = value => `${value < -.00001 ? '−' : value > .00001 ? '+' : ''}${Math.abs(value).toFixed(1)}`;
  const decimal = value => value < -.00001 ? `(${Math.abs(value).toFixed(1)})` : value.toFixed(1);
  const sum = values => values.reduce((a,b) => a+b,0);
  const icon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14a8 8 0 1 0 2-8M4 4v6h6"/></svg>';

  function metric(key, label, value, note, kind='money') {
    const formatted = kind === 'money' ? money(value) : `${Math.round(value)} ${kind}`;
    return `<div class="live-metric"><dt>${label}</dt><dd><span class="sr-only">${formatted}</span><span aria-hidden="true" data-counter="${key}" data-value="${value}" data-kind="${kind}">${formatted}</span></dd><span class="metric-note">${note}</span></div>`;
  }
  function table(caption, headers, rows) {
    return `<div class="data-table-scroll" tabindex="0" role="region" aria-label="${caption}, scroll to read all columns"><table class="finance-table"><caption>${caption}</caption><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row,i)=>`<tr${i === rows.length-1 ? ' class="total-row"' : ''}><th scope="row">${row[0]}</th>${row.slice(1).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function axes(max, ticks, width=600) {
    return ticks.map(v=>{
      const y=210-v/max*170;
      return `<line x1="42" y1="${y}" x2="${width-12}" y2="${y}" class="chart-grid"/><text x="31" y="${y+4}" text-anchor="end" class="axis-label">${v}</text>`;
    }).join('');
  }
  function revenueChart(selected) {
    const points=months.map((m,i)=>`${86+i*94},${210-m.budget/15*170}`).join(' ');
    return `<svg class="live-chart" viewBox="0 0 600 260" role="group" aria-label="Revenue versus budget from April to September 2026. Select a month to inspect its performance.">${axes(15,[0,5,10,15])}<polyline points="${points}" class="budget-line"/>${months.map((m,i)=>{
      const x=86+i*94, height=m.revenue/15*170;
      return `<g class="chart-choice${i===selected?' selected':''}" role="button" tabindex="0" aria-pressed="${i===selected}" aria-label="${m.name}: revenue ${money(m.revenue)}, budget ${money(m.budget)}" data-choice="${i}" data-readout="${m.name}: ${money(m.revenue)} actual / ${money(m.budget)} budget"><rect x="${x-42}" y="25" width="84" height="228" fill="transparent" class="chart-hit"/><rect x="${x-21}" y="${210-height}" width="42" height="${height}" class="chart-bar" style="--bar-delay:${i*65}ms"/><text x="${x}" y="${210-height-10}" text-anchor="middle" class="bar-label">${m.revenue.toFixed(1)}</text><circle cx="${x}" cy="${210-m.budget/15*170}" r="3.5" class="budget-point"/><text x="${x}" y="237" text-anchor="middle" class="axis-label">${m.short}</text></g>`;
    }).join('')}</svg>`;
  }
  function ageingChart(data) {
    const labels=['Current','1–30','31–60','61–90','90+'];
    return `<svg class="live-chart" viewBox="0 0 600 260" role="img" aria-label="${data.label} by due-date bucket, INR millions: ${data.buckets.map((v,i)=>`${labels[i]} ${v.toFixed(1)}`).join(', ')}">${axes(5,[0,1,2,3,4,5])}${data.buckets.map((v,i)=>{
      const x=102+i*106,height=v/5*170;
      return `<g><rect x="${x-25}" y="${210-height}" width="50" height="${height}" class="chart-bar${i>2?' overdue-bar':''}" style="--bar-delay:${i*65}ms"/><text x="${x}" y="${210-height-10}" text-anchor="middle" class="bar-label">${v.toFixed(1)}</text><text x="${x}" y="237" text-anchor="middle" class="axis-label">${labels[i]}</text></g>`;
    }).join('')}</svg>`;
  }
  function entityChart(selected) {
    return `<svg class="live-chart entity-chart" viewBox="0 0 600 190" role="group" aria-label="Entity revenue before intercompany eliminations. Select an entity to inspect its profit and loss.">${entities.map((e,i)=>{
      const y=20+i*57;
      return `<g class="chart-choice${selected===String(i)?' selected':''}" role="button" tabindex="0" aria-pressed="${selected===String(i)}" aria-label="${e.name}: revenue ${money(e.revenue)}" data-choice="${i}" data-readout="${e.name}: ${money(e.revenue)} revenue before eliminations"><rect x="0" y="${y-9}" width="600" height="49" fill="transparent" class="chart-hit"/><text x="3" y="${y+20}" class="axis-label">${e.name}</text><rect x="104" y="${y}" width="380" height="29" class="bar-track"/><rect x="104" y="${y}" width="${e.revenue/15*380}" height="29" class="chart-bar horizontal-bar" style="--bar-delay:${i*90}ms"/><text x="506" y="${y+20}" class="bar-label">${money(e.revenue)}</text></g>`;
    }).join('')}</svg>`;
  }

  function cfoView(index) {
    const m=months[index],gross=m.revenue-m.cost,ebitda=gross-m.opex,budgetGross=m.budget-m.costBudget,budgetEbitda=budgetGross-m.opexBudget;
    return {
      metrics:metric('revenue','Revenue',m.revenue,`${signed((m.revenue/m.budget-1)*100)}% vs budget`)+metric('ebitda','EBITDA',ebitda,`${(ebitda/m.revenue*100).toFixed(1)}% EBITDA margin`)+metric('cash','Closing cash',m.cash,`${money(m.cash-m.opening)} net cash movement`)+metric('days','Receivable days',m.days,'Target: 40 days','days'),
      content:`<div class="dashboard-columns"><div class="chart-block"><div class="chart-heading"><h4>Revenue performance</h4><span class="chart-unit">INR millions</span></div><div class="chart-legend"><span><i></i>Actual</span><span><i class="budget-swatch"></i>Budget</span></div>${revenueChart(index)}<p class="chart-readout">${m.name}: ${money(m.revenue)} actual / ${money(m.budget)} budget</p><p class="chart-instruction">Select a bar to explore that month.</p></div>${table(`${m.name} performance`,['INR m','Actual','Budget','Variance'],[['Revenue',decimal(m.revenue),decimal(m.budget),signed(m.revenue-m.budget)],['Cost of sales',decimal(-m.cost),decimal(-m.costBudget),signed(m.costBudget-m.cost)],['Gross profit',decimal(gross),decimal(budgetGross),signed(gross-budgetGross)],['Operating costs',decimal(-m.opex),decimal(-m.opexBudget),signed(m.opexBudget-m.opex)],['EBITDA',decimal(ebitda),decimal(budgetEbitda),signed(ebitda-budgetEbitda)]])}</div><div class="cash-bridge"><h4>Cash movement <span>Opening + operating + investing + financing = closing</span></h4><dl>${[['Opening',m.opening],['Operating',m.operating],['Investing',m.investing],['Financing',m.financing],['Closing',m.cash]].map(([label,value])=>`<div><dt>${label}</dt><dd>${['Opening','Closing'].includes(label)?'':value>=0?'+':'−'}${money(Math.abs(value))}</dd></div>`).join('')}</dl></div>`,
      summary:`${m.name} 2026. Revenue ${money(m.revenue)}, EBITDA ${money(ebitda)}, closing cash ${money(m.cash)}.`
    };
  }
  function ageingView(scope) {
    const d=ageing[scope],overdue=sum(d.buckets.slice(1)),older=sum(d.buckets.slice(3));
    const rows=d.balances.map((values,i)=>[d.names[i],...values.map(v=>v.toFixed(2)),sum(values).toFixed(2)]);
    rows.push([`Total ${d.label.toLowerCase()}`,...d.buckets.map(v=>v.toFixed(2)),d.total.toFixed(2)]);
    return {
      metrics:metric('balance',`Total ${d.label.toLowerCase()}`,d.total,'Open balances at 30 Sep 2026')+metric('overdue','Overdue balance',overdue,`${(overdue/d.total*100).toFixed(1)}% of open balances`)+metric('older','Beyond 60 days',older,'61–90 and 90+ day buckets')+metric('net','Net AR / AP',3.3,'₹8.4m receivables − ₹5.1m payables'),
      content:`<div class="dashboard-columns"><div class="chart-block"><div class="chart-heading"><h4>${d.label} ageing</h4><span class="chart-unit">INR millions</span></div>${ageingChart(d)}<p class="chart-readout">${money(overdue)} overdue / ${money(d.total)} total ${d.label.toLowerCase()}</p></div><aside class="management-note"><span>WORKING CAPITAL FOCUS</span><h4>${money(older)} beyond 60 days</h4><p>${scope==='ar'?'Confirm disputed invoices and payment commitments. Use ageing and balances to prioritise customer follow-up.':'Check supplier due dates and resolve disputed balances. Build the next payment run around available cash and agreed terms.'}</p><p>Ageing is calculated from the invoice due date.</p></aside></div>${table(`Sample ${scope==='ar'?'customer':'supplier'} balances · INR millions`,['Account','Current','1–30','31–60','61–90','90+','Total'],rows)}`,
      summary:`${d.label}. Total ${money(d.total)}, overdue ${money(overdue)}, beyond 60 days ${money(older)}.`
    };
  }
  function misView(scope) {
    const group=scope==='group',entity=group?null:entities[Number(scope)],revenue=group?24.3:entity.revenue,cost=group?13.5:entity.cost,opex=group?5.2:entity.opex,ebitda=revenue-cost-opex;
    const rows=group?[
      ['Revenue','12.6','8.4','6.1','(2.8)','24.3'],['Cost of sales','(7.4)','(5.0)','(3.9)','2.8','(13.5)'],['Gross profit','5.2','3.4','2.2','—','10.8'],['Operating costs','(2.4)','(1.6)','(1.2)','—','(5.2)'],['EBITDA','2.8','1.8','1.0','—','5.6']
    ]:[['Revenue',decimal(revenue)],['Cost of sales',decimal(-cost)],['Gross profit',decimal(revenue-cost)],['Operating costs',decimal(-opex)],['EBITDA',decimal(ebitda)]];
    return {
      metrics:metric('revenue',group?'Group revenue':'Entity revenue',revenue,group?'After intercompany eliminations':'Before intercompany eliminations')+metric('ebitda',group?'Group EBITDA':'Entity EBITDA',ebitda,`${(ebitda/revenue*100).toFixed(1)}% EBITDA margin`)+metric('scope','Reporting scope',group?3:1,group?'Entity A · Entity B · Entity C':entity.name,group?'entities':'entity')+metric('eliminations','Group eliminations',2.8,'Matched revenue and cost eliminations'),
      content:`${table(group?'Consolidated P&L · September 2026':`${entity.name} P&L · September 2026`,group?['INR m','Entity A','Entity B','Entity C','Eliminations','Group']:['INR m',entity.name],rows)}<div class="dashboard-columns consolidation-detail"><div class="chart-block"><div class="chart-heading"><h4>Entity contribution</h4><span class="chart-unit">Pre-elimination revenue</span></div>${entityChart(scope)}<p class="chart-readout">${group?'Three entities, one reconciled group view.':`${entity.name}: ${money(revenue)} revenue / ${money(ebitda)} EBITDA`}</p><p class="chart-instruction">Select an entity to inspect its P&L.</p></div><aside class="management-note"><span>CONSOLIDATION CHECK</span><dl><div><dt>Entity revenue total</dt><dd>₹27.1m</dd></div><div><dt>Intercompany eliminated</dt><dd>(₹2.8m)</dd></div><div><dt>Group revenue</dt><dd>₹24.3m</dd></div></dl><p>Eliminations apply to the group view. Entity views show performance before consolidation.</p></aside></div>`,
      summary:`${group?'Consolidated group':entity.name}. Revenue ${money(revenue)}, EBITDA ${money(ebitda)}.`
    };
  }
  const definitions={
    cfo:{title:'Executive finance overview',initial:'5',controls:`<label>Reporting month<select data-filter aria-label="Executive report month">${months.map((m,i)=>`<option value="${i}"${i===5?' selected':''}>${m.name} 2026</option>`).join('')}</select></label>`,view:state=>cfoView(Number(state))},
    ageing:{title:'Receivables & payables ageing',initial:'ar',controls:'<div class="balance-switch" role="group" aria-label="Balance type"><button type="button" data-scope="ar" aria-pressed="true">Receivables</button><button type="button" data-scope="ap" aria-pressed="false">Payables</button></div>',view:ageingView},
    mis:{title:'Multi-entity management report',initial:'group',controls:`<label>Reporting scope<select data-filter aria-label="Consolidation reporting scope"><option value="group">Consolidated group</option>${entities.map((e,i)=>`<option value="${i}">${e.name}</option>`).join('')}</select></label>`,view:misView}
  };

  function formatCounter(value,kind) {
    return kind==='money'?money(value):`${Math.round(value)} ${kind}`;
  }
  function animateCounters(root,previous=new Map()) {
    root.querySelectorAll('[data-counter]').forEach(node=>{
      const target=Number(node.dataset.value),from=previous.get(node.dataset.counter)??0,kind=node.dataset.kind;
      if(motion.matches || document.hidden){node.textContent=formatCounter(target,kind);return;}
      const started=performance.now();
      function tick(now) {
        if(!node.isConnected)return;
        const progress=Math.min(1,(now-started)/850);
        node.textContent=formatCounter(from+(target-from)*(1-Math.pow(1-progress,3)),kind);
        if(progress<1 && !motion.matches)requestAnimationFrame(tick);
        else node.textContent=formatCounter(target,kind);
      }
      requestAnimationFrame(tick);
    });
  }
  const chartObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      if(!motion.matches)entry.target.classList.add('chart-playing');
      chartObserver.unobserve(entry.target);
    });
  },{threshold:.15});
  const reportObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const controller=controllers.get(entry.target.dataset.report);
      if(controller && !controller.entered){controller.entered=true;animateCounters(entry.target);}
      reportObserver.unobserve(entry.target);
    });
  },{threshold:.08});

  Object.entries(definitions).forEach(([id,definition])=>{
    const panel=document.getElementById(`panel-${id}`),frame=panel.querySelector('.report-frame');
    const root=document.createElement('div');root.className='live-dashboard';root.dataset.report=id;
    root.innerHTML=`<div class="dashboard-topline"><span>BR / FINANCE INTELLIGENCE</span><span>ILLUSTRATIVE DATA</span></div><div class="dashboard-toolbar"><h3>${definition.title}</h3><div class="dashboard-controls">${definition.controls}<button type="button" class="replay-dashboard" aria-label="Replay ${definition.title} animation">${icon}<span>Replay</span></button></div></div><dl class="live-metrics"></dl><div class="dashboard-content"></div><p class="dashboard-footnote">Sample data · INR millions unless stated · ${id==='cfo'?'Apr–Sep':'September'} 2026</p><p class="dashboard-status sr-only" role="status" aria-live="polite"></p>`;
    const controller={root,state:definition.initial,entered:false};controllers.set(id,controller);
    function render(next,announce=false) {
      const previous=new Map([...root.querySelectorAll('[data-counter]')].map(n=>[n.dataset.counter,Number(n.dataset.value)]));
      root.querySelectorAll('.live-chart').forEach(chart=>chartObserver.unobserve(chart));
      controller.state=next;
      const view=definition.view(next);
      root.querySelector('.live-metrics').innerHTML=view.metrics;
      root.querySelector('.dashboard-content').innerHTML=view.content;
      root.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===next)));
      const select=root.querySelector('[data-filter]');if(select)select.value=next;
      if(announce)root.querySelector('.dashboard-status').textContent=view.summary;
      root.querySelectorAll('.live-chart').forEach(chart=>chartObserver.observe(chart));
      if(controller.entered)animateCounters(root,previous);
    }
    render(controller.state);
    frame.prepend(root);frame.querySelector('img').hidden=true;frame.classList.add('is-interactive');
    reportObserver.observe(root);
    root.addEventListener('change',event=>{
      if(event.target.matches('[data-filter]'))render(event.target.value,true);
    });
    function choose(event) {
      const choice=event.target.closest('[data-choice]');
      if(!choice)return;
      const value=choice.dataset.choice,keyboard=event.type==='keydown';
      render(value,true);
      if(keyboard)root.querySelector(`[data-choice="${value}"]`)?.focus({preventScroll:true});
    }
    root.addEventListener('click',event=>{
      const scope=event.target.closest('[data-scope]');
      if(scope)render(scope.dataset.scope,true);
      else if(event.target.closest('.replay-dashboard')){
        if(motion.matches)return;
        animateCounters(root);
        root.querySelectorAll('.live-chart').forEach(chart=>{
          chart.classList.remove('chart-playing');void chart.getBoundingClientRect();chart.classList.add('chart-playing');
        });
      } else choose(event);
    });
    root.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ') && event.target.matches('[data-choice]')){event.preventDefault();choose(event);}
    });
    function inspect(event) {
      const choice=event.target.closest('[data-readout]');
      if(choice)root.querySelector('.chart-readout').textContent=choice.dataset.readout;
    }
    root.addEventListener('pointerover',inspect);root.addEventListener('focusin',inspect);
  });
  document.addEventListener('reportselected',event=>{
    const root=controllers.get(event.detail)?.root;
    if(root)root.querySelectorAll('.live-chart').forEach(chart=>{
      chart.classList.remove('chart-playing');chartObserver.observe(chart);
    });
  });
  motion.addEventListener('change',()=>{
    if(motion.matches)document.querySelectorAll('[data-counter]').forEach(node=>node.textContent=formatCounter(Number(node.dataset.value),node.dataset.kind));
  });
})();
