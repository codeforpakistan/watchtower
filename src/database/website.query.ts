const get_websites = () => `SELECT id,url FROM websites;`;
const store_website_stats = (websiteId: number,  stats: object) => `
  INSERT INTO website_stats (website_id, stats)
  VALUES (${websiteId},  '${JSON.stringify(stats)}'::jsonb) ON CONFLICT (website_id) DO NOTHING returning id;
`;
const store_websites=(values:string)=> `
insert into public.websites (url) values ${values} ON CONFLICT (url) DO NOTHING RETURNING id;`

  interface Param {
    url?: string;
  }
  
  const get_stats_q = (url:string) => `
    SELECT ws.website_id, w.url,ws.stats
    FROM website_stats ws
    JOIN websites w
    ON ws.website_id = w.id
    --${url && url !== "" ? `WHERE w.url = '${url}'` : ""}
  `;

export {get_websites,store_website_stats,get_stats_q,store_websites};