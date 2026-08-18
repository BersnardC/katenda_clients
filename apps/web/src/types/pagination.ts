// Nuevo contrato REST de katenda_api:
// index -> { data: [...], links: {...}, meta: {...} }  (Resource::collection)
// store/show/update -> { data: <item> }                 (Resource::make)
// destroy -> 204                                        (sin body)
// activate/deactivate -> { message }

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface Paginated<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// Paginator crudo de Laravel (sin Resource): usado por endpoints legacy
// como GET /stores/{storeUuid}/products -> { products: RawPaginated }
export interface RawPaginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
