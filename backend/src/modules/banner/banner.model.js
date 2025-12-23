import pool from "../../db/pool.js";

export async function findAll({
  vitri = null,
  activeOnly = true,
  visibleNowOnly = true,
}) {
  const conditions = [];
  const values = [];
  let i = 1;

  if (vitri) {
    conditions.push(`vitri = $${i++}`);
    values.push(vitri);
  }

  if (activeOnly) {
    conditions.push(`trangthai = TRUE`);
  }

  if (visibleNowOnly) {
    conditions.push(`(thoigianbatdau IS NULL OR thoigianbatdau <= NOW())`);
    conditions.push(`(thoigianketthuc IS NULL OR thoigianketthuc >= NOW())`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM public.banner
    ${where}
    ORDER BY vitri ASC, thutuhienthi ASC, created_at DESC
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM public.banner WHERE bannerid = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function insert(data) {
  const sql = `
    INSERT INTO public.banner
      (ten, mota, imageurl, linkurl, vitri, thutuhienthi, trangthai, thoigianbatdau, thoigianketthuc, updated_at)
    VALUES
      ($1,  $2,   $3,      $4,     $5,    $6,           $7,        $8,             $9,             NOW())
    RETURNING *
  `;

  const values = [
    data.ten,
    data.mota,
    data.imageurl,
    data.linkurl,
    data.vitri,
    data.thutuhienthi,
    data.trangthai,
    data.thoigianbatdau,
    data.thoigianketthuc,
  ];

  const { rows } = await pool.query(sql, values);
  return rows[0];
}

export async function updateById(id, patch) {
  const fields = [];
  const values = [];
  let i = 1;

  const setField = (col, val) => {
    fields.push(`${col} = $${i++}`);
    values.push(val);
  };

  if (patch.ten !== undefined) setField("ten", patch.ten);
  if (patch.mota !== undefined) setField("mota", patch.mota);
  if (patch.imageurl !== undefined) setField("imageurl", patch.imageurl);
  if (patch.linkurl !== undefined) setField("linkurl", patch.linkurl);
  if (patch.vitri !== undefined) setField("vitri", patch.vitri);
  if (patch.thutuhienthi !== undefined)
    setField("thutuhienthi", patch.thutuhienthi);
  if (patch.trangthai !== undefined) setField("trangthai", patch.trangthai);
  if (patch.thoigianbatdau !== undefined)
    setField("thoigianbatdau", patch.thoigianbatdau);
  if (patch.thoigianketthuc !== undefined)
    setField("thoigianketthuc", patch.thoigianketthuc);

  // luôn update updated_at
  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) {
    // chỉ có updated_at -> vẫn cho update
  }

  values.push(id);

  const sql = `
    UPDATE public.banner
    SET ${fields.join(", ")}
    WHERE bannerid = $${i}
    RETURNING *
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.banner WHERE bannerid = $1`,
    [id]
  );
  return rowCount > 0;
}
