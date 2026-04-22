import * as React from "react";

import { cn } from "@/lib/utils";

function TypoH1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="typo-h1"
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...props}
    />
  );
}

function TypoH2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="typo-h2"
      className={cn(
        "scroll-m-20 font-heading text-xl font-bold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  );
}

function TypoH3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="typo-h3"
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function TypoP({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="typo-p"
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  );
}

function TypoList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="typo-list"
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  );
}

function TypoLead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="typo-lead"
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    />
  );
}

function TypoLarge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="typo-large"
      className={cn("text-lg leading-snug font-medium", className)}
      {...props}
    />
  );
}

function TypoSmall({ className, ...props }: React.ComponentProps<"small">) {
  return (
    <small
      data-slot="typo-small"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

function TypoMuted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="typo-muted"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  TypoH1,
  TypoH2,
  TypoH3,
  TypoP,
  TypoList,
  TypoLead,
  TypoLarge,
  TypoSmall,
  TypoMuted,
};
