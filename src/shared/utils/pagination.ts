export interface PaginationQuery {
  page?: string | number;
  perPage?: string | number;
}

export interface PaginationParams {
  page: number;
  perPage: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

export function parsePagination(query: PaginationQuery): PaginationParams {
  let page = Number(query.page) || DEFAULT_PAGE;
  let perPage = Number(query.perPage) || DEFAULT_PER_PAGE;

  if (page < 1) page = DEFAULT_PAGE;
  if (perPage < 1) perPage = DEFAULT_PER_PAGE;
  if (perPage > MAX_PER_PAGE) perPage = MAX_PER_PAGE;

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  };
}

export function createPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  return {
    page: params.page,
    perPage: params.perPage,
    total,
    totalPages: Math.ceil(total / params.perPage) || 1,
  };
}
