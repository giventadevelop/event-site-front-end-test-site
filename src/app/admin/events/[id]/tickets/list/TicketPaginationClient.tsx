"use client";
import { Pagination } from '@/components/Pagination';

interface TicketPaginationClientProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
}

export default function TicketPaginationClient({ totalItems, pageSize, currentPage }: TicketPaginationClientProps) {
  return <Pagination totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} />;
}