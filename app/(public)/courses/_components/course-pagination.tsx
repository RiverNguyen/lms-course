"use client";

import ReactPaginate from "react-paginate";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CoursePaginationProps {
  currentPage: number;
  totalPages: number;
}

const CoursePagination = ({
  currentPage,
  totalPages,
}: CoursePaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handlePageClick = (event: { selected: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    const newPage = event.selected + 1; // react-paginate uses 0-based index
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8">
      <ReactPaginate
        breakLabel="..."
        nextLabel={<ChevronRight className="size-4" />}
        previousLabel={<ChevronLeft className="size-4" />}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        pageCount={totalPages}
        forcePage={currentPage - 1} // react-paginate uses 0-based index
        renderOnZeroPageCount={null}
        className="flex items-center justify-center gap-2"
        pageClassName=""
        pageLinkClassName="flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        activeClassName=""
        activeLinkClassName="bg-primary text-primary-foreground hover:bg-primary/90"
        previousClassName=""
        previousLinkClassName="flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        nextClassName=""
        nextLinkClassName="flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        breakClassName="px-2 text-muted-foreground"
        disabledClassName="opacity-50 cursor-not-allowed"
        disabledLinkClassName="pointer-events-none"
      />
    </div>
  );
};

export default CoursePagination;
