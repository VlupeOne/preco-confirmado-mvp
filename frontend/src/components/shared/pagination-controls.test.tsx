import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PaginationControls } from "@/components/shared/pagination-controls";

it("navega entre páginas respeitando limites", async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn();
  render(
    <PaginationControls
      page={1}
      totalPages={3}
      totalElements={25}
      onPageChange={onPageChange}
    />,
  );

  await user.click(screen.getByRole("button", { name: /anterior/i }));
  await user.click(screen.getByRole("button", { name: /próxima/i }));
  expect(onPageChange).toHaveBeenNthCalledWith(1, 0);
  expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
});
