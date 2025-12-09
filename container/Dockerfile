FROM archlinux:latest

# Install necessary packages
RUN pacman-key --init
RUN pacman -Syu --noconfirm \
  git \
  sudo \
  python \
  python-flask \
  python-bcrypt \
  curl \
  && pacman -Scc --noconfirm

ARG USERNAME=boom-dev
RUN groupadd -g 1000 ${USERNAME} \
    && useradd -m -u 1000 -g 1000 -s /bin/bash ${USERNAME} \
    && usermod -aG wheel ${USERNAME}
RUN sed -i 's/^# %wheel ALL=(ALL:ALL) ALL$/%wheel ALL=(ALL:ALL) ALL/' /etc/sudoers

USER ${USERNAME}
RUN mkdir /home/${USERNAME}/.config
WORKDIR /home/${USERNAME}/.config
RUN git clone https://github.com/Vision940/boom.git
WORKDIR /home/${USERNAME}/.config/boom
RUN bash .boominstaller.bash skippermcheck <<<"y"
RUN bash .siteconfig.bash <<<"y"
# Host site on 5252 in container
RUN sed -ne 's/\(BOOMPORT="\)[0-9]+/\15252/p' ~/.local/share/boom/.boomconfig
RUN sed -i "\|BOOMPORT| s|9029|\"5252\"|" ~/.local/share/boom/.boomserver/.boombackend.py

CMD ["/bin/bash"]

