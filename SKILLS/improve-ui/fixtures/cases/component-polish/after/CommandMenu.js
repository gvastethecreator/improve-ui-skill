(function exposeCommandMenu(global) {
  "use strict";

  let nextInstance = 0;

  function mountCommandMenu(root, options = {}) {
    if (!root || typeof root.replaceChildren !== "function") {
      throw new TypeError("mountCommandMenu requires a DOM element root");
    }
    if (typeof options.onOpenRecentProject !== "function") {
      throw new TypeError("mountCommandMenu requires onOpenRecentProject");
    }

    nextInstance += 1;
    const document = root.ownerDocument;
    const trigger = document.createElement("button");
    const menu = document.createElement("section");
    const recentProject = document.createElement("button");
    const shortcut = document.createElement("img");
    const menuId = options.menuId || `command-menu-${nextInstance}`;

    trigger.id = options.triggerId || `command-menu-trigger-${nextInstance}`;
    trigger.type = "button";
    trigger.textContent = "Search commands";
    trigger.setAttribute("aria-controls", menuId);
    trigger.setAttribute("aria-expanded", "false");

    menu.id = menuId;
    menu.className = "command-menu";
    menu.setAttribute("aria-label", "Commands");
    menu.dataset.state = "closed";
    menu.hidden = true;

    recentProject.id = options.recentProjectId || `recent-project-${nextInstance}`;
    recentProject.type = "button";
    recentProject.textContent = "Open recent project";

    shortcut.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    shortcut.alt = "";
    shortcut.width = 320;
    shortcut.height = 96;

    menu.append(recentProject, shortcut);
    root.replaceChildren(trigger, menu);

    function setOpen(open) {
      menu.hidden = !open;
      menu.dataset.state = open ? "open" : "closed";
      trigger.setAttribute("aria-expanded", String(open));
      if (open) recentProject.focus();
      else trigger.focus();
    }

    function toggleMenu() {
      setOpen(menu.hidden);
    }

    function handleMenuKeydown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    function openRecentProject() {
      options.onOpenRecentProject();
      setOpen(false);
    }

    trigger.addEventListener("click", toggleMenu);
    menu.addEventListener("keydown", handleMenuKeydown);
    recentProject.addEventListener("click", openRecentProject);

    return {
      destroy() {
        trigger.removeEventListener("click", toggleMenu);
        menu.removeEventListener("keydown", handleMenuKeydown);
        recentProject.removeEventListener("click", openRecentProject);
        root.replaceChildren();
      },
      setOpen,
    };
  }

  global.mountCommandMenu = mountCommandMenu;
})(window);
